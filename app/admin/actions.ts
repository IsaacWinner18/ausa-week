"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { normalizeEmail } from "@/lib/api";
import { requireApprovedAdmin } from "@/lib/admin";
import { connectToDatabase } from "@/lib/db";
import { createAdminSession, deleteAdminSession } from "@/lib/session";
import { createCategorySlug, createParticipantSlug } from "@/lib/voting";
import { uploadToR2 } from "@/lib/r2";
import { CategoryModel } from "@/models/Category";
import { ParticipantModel } from "@/models/Participant";
import { UserModel } from "@/models/User";

export type ActionState = {
  success?: boolean;
  message?: string;
};

const authSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  email: z.email().trim().toLowerCase(),
  password: z.string().min(8).max(100),
});

const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(300).optional(),
});

const participantSchema = z.object({
  name: z.string().trim().min(2).max(120),
  bio: z.string().trim().max(500).optional(),
  categorySlugs: z.array(z.string().trim().min(1)).min(1),
});

export async function signupAdmin(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = authSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success || !parsed.data.name) {
    return {
      success: false,
      message:
        "Enter a valid name, email, and password of at least 8 characters.",
    };
  }

  await connectToDatabase();

  const email = normalizeEmail(parsed.data.email);
  const existingUser = await UserModel.findOne({ email });

  if (existingUser?.passwordHash) {
    return {
      success: false,
      message:
        "An account with this email already exists. Please log in instead.",
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const user = await UserModel.findOneAndUpdate(
    { email },
    {
      name: parsed.data.name.trim(),
      email,
      passwordHash,
      adminStatus: "pending",
      isAdmin: false,
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    },
  );

  await createAdminSession({
    userId: user._id.toString(),
    email: user.email,
    isAdmin: user.isAdmin,
    adminStatus: user.adminStatus,
  });

  redirect("/admin");
}

export async function loginAdmin(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = authSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Enter a valid email and password.",
    };
  }

  await connectToDatabase();

  const user = await UserModel.findOne({
    email: normalizeEmail(parsed.data.email),
  });

  if (!user?.passwordHash) {
    return {
      success: false,
      message: "No admin account was found for this email.",
    };
  }

  const isValidPassword = await bcrypt.compare(
    parsed.data.password,
    user.passwordHash,
  );

  if (!isValidPassword) {
    return {
      success: false,
      message: "Incorrect password.",
    };
  }

  user.lastLoginAt = new Date();
  await user.save();

  await createAdminSession({
    userId: user._id.toString(),
    email: user.email,
    isAdmin: user.isAdmin,
    adminStatus: user.adminStatus,
  });

  redirect("/admin");
}

export async function logoutAdmin() {
  await deleteAdminSession();
  redirect("/admin/login");
}

export async function createCategoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireApprovedAdmin();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
  });

  if (!parsed.success) {
    return {
      success: false,
      message: "Enter a valid category name.",
    };
  }

  await connectToDatabase();

  const slug = await createCategorySlug(parsed.data.name);

  await CategoryModel.create({
    name: parsed.data.name,
    slug,
    description: parsed.data.description ?? "",
  });

  revalidatePath("/admin");

  return {
    success: true,
    message: "Category created.",
  };
}

export async function createParticipantAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireApprovedAdmin();

  const parsed = participantSchema.safeParse({
    name: formData.get("name"),
    bio: formData.get("bio") ?? "",
    categorySlugs: formData.getAll("categorySlugs"),
  });

  if (!parsed.success) {
    return {
      success: false,
      message:
        "Enter valid participant details and select at least one category.",
    };
  }

  const imageFile = formData.get("image") as File | null;
  let imageUrl = "";

  try {
    if (imageFile && imageFile.size > 0) {
      const extension = imageFile.name.split(".").pop();
      const key = `participants/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
      imageUrl = await uploadToR2(imageFile, key);
    }
  } catch (error) {
    console.error("R2 Upload Error:", error);
    return {
      success: false,
      message: "Failed to upload image. Please try again.",
    };
  }

  const categorySlugs = parsed.data.categorySlugs
    .map((slug) => slug.trim().toLowerCase())
    .filter(Boolean);

  if (categorySlugs.length === 0) {
    return {
      success: false,
      message: "Provide at least one category.",
    };
  }

  await connectToDatabase();

  const categories = await CategoryModel.find({
    slug: { $in: categorySlugs },
  });

  if (categories.length === 0) {
    return {
      success: false,
      message: "Selected categories were not found.",
    };
  }

  const slug = await createParticipantSlug(parsed.data.name);

  await ParticipantModel.create({
    name: parsed.data.name,
    slug,
    bio: parsed.data.bio ?? "",
    imageUrl,
    categoryIds: categories.map((c) => c._id),
  });

  revalidatePath("/admin/participants");

  return {
    success: true,
    message: "Participant created.",
  };
}

export async function approveAdminAction(userId: string) {
  const currentAdmin = await requireApprovedAdmin();

  await connectToDatabase();

  await UserModel.findByIdAndUpdate(userId, {
    isAdmin: true,
    adminStatus: "approved",
    approvedByUserId: currentAdmin.id,
    approvedAt: new Date(),
  });

  revalidatePath("/admin");
}

export async function rejectAdminAction(userId: string) {
  await requireApprovedAdmin();

  await connectToDatabase();

  await UserModel.findByIdAndUpdate(userId, {
    isAdmin: false,
    adminStatus: "rejected",
    approvedByUserId: null,
    approvedAt: null,
  });

  revalidatePath("/admin");
}
