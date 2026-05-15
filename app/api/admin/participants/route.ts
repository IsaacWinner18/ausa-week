import type { NextRequest } from "next/server";

import {
  asTrimmedStringArray,
  badRequest,
  jsonResponse,
  isNonEmptyString,
  safeJson,
  serverError,
  verifyAdminRequest,
} from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { createParticipantSlug, serializeParticipant } from "@/lib/voting";
import { CategoryModel } from "@/models/Category";
import { ParticipantModel } from "@/models/Participant";

type CreateParticipantBody = {
  name?: string;
  bio?: string;
  imageUrl?: string;
  categorySlugs?: string[];
  isActive?: boolean;
};

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const adminCheck = await verifyAdminRequest(request);
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let name: string | undefined;
    let bio: string | undefined;
    let imageUrl: string | undefined;
    let categorySlugs: string[] = [];
    let isActive = true;
    let imageFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      console.log(
        "Creating participant with multipart/form-data:",
        Object.fromEntries(formData.entries()),
      );

      name = formData.get("name") as string;
      bio = formData.get("bio") as string;
      // Handle both categorySlugs and categorySlugs[]
      const slugs = formData.getAll("categorySlugs") as string[];
      const slugsArray = formData.getAll("categorySlugs[]") as string[];
      categorySlugs = slugs.length > 0 ? slugs : slugsArray;
      imageFile = formData.get("image") as File | null;
      isActive = formData.get("isActive") !== "false";
    } else {
      const body = await safeJson<CreateParticipantBody>(request);
      console.log("Creating participant with JSON:", body);
      if (!body) {
        return badRequest("Invalid JSON body.");
      }
      name = body.name;
      bio = body.bio;
      imageUrl = body.imageUrl;
      categorySlugs = asTrimmedStringArray(body.categorySlugs);
      isActive = body.isActive !== false;
    }

    if (!name || !isNonEmptyString(name)) {
      return badRequest("Participant name is required.");
    }

    if (categorySlugs.length === 0) {
      return badRequest("At least one category slug is required.");
    }

    await connectToDatabase();

    const categories = await CategoryModel.find({
      slug: { $in: categorySlugs.map((slug) => slug.toLowerCase()) },
    });

    if (categories.length === 0) {
      return badRequest("No valid categories found.");
    }

    if (imageFile && imageFile.size > 0) {
      const { uploadToR2 } = await import("@/lib/r2");
      const extension = imageFile.name.split(".").pop();
      const key = `participants/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
      imageUrl = await uploadToR2(imageFile, key);
    }

    const slug = await createParticipantSlug(name);
    const participant = await ParticipantModel.create({
      name: name.trim(),
      slug,
      bio: bio ? bio.trim() : "",
      imageUrl: imageUrl || "",
      categoryIds: categories.map((category) => category._id),
      isActive,
    });

    await participant.populate("categoryIds");

    return jsonResponse(
      {
        success: true,
        participant: serializeParticipant(participant),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create participant", error);
    return serverError("Failed to create participant.");
  }
}
