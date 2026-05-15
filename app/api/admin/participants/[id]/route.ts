import type { NextRequest } from "next/server";
import {
  badRequest,
  jsonResponse,
  notFound,
  safeJson,
  serverError,
  verifyAdminRequest,
  asTrimmedStringArray,
} from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { serializeParticipant } from "@/lib/voting";
import { CategoryModel } from "@/models/Category";
import { ParticipantModel } from "@/models/Participant";

export const runtime = "nodejs";

type UpdateParticipantBody = {
  name?: string;
  bio?: string;
  imageUrl?: string;
  categorySlugs?: string[];
  isActive?: boolean;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminCheck = await verifyAdminRequest(request);
  if (!adminCheck.ok) return adminCheck.response;

  const { id } = await params;

  try {
    await connectToDatabase();
    const participant = await ParticipantModel.findById(id);
    if (!participant) return notFound("Participant not found.");

    // Check if it's multipart/form-data (contains file)
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      console.log(
        "Updating participant with multipart/form-data:",
        Object.fromEntries(formData.entries()),
      );

      const name = formData.get("name") as string | null;
      const bio = formData.get("bio") as string | null;
      const isActiveStr = formData.get("isActive") as string | null;

      const slugs = formData.getAll("categorySlugs") as string[];
      const slugsArray = formData.getAll("categorySlugs[]") as string[];
      const categorySlugs = slugs.length > 0 ? slugs : slugsArray;

      const imageFile = formData.get("image") as File | null;

      if (name !== null) participant.name = name.trim();
      if (bio !== null) participant.bio = bio.trim();
      if (isActiveStr !== null) participant.isActive = isActiveStr !== "false";

      if (categorySlugs.length > 0) {
        const categories = await CategoryModel.find({
          slug: { $in: categorySlugs.map((s) => s.toLowerCase()) },
        });
        if (categories.length > 0) {
          participant.categoryIds = categories.map((c) => c._id);
        }
      }

      if (imageFile && imageFile.size > 0) {
        console.log(
          `Processing image upload for participant ${id}: ${imageFile.name}`,
        );
        const { uploadToR2 } = await import("@/lib/r2");
        const extension = imageFile.name.split(".").pop();
        const key = `participants/${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
        participant.imageUrl = await uploadToR2(imageFile, key);
      }
    } else {
      // Standard JSON update
      const body = await safeJson<UpdateParticipantBody>(request);
      console.log("Updating participant with JSON:", body);

      if (!body) return badRequest("Invalid JSON body.");

      if (body.name !== undefined) participant.name = body.name.trim();
      if (body.bio !== undefined) participant.bio = body.bio.trim();
      if (body.imageUrl !== undefined)
        participant.imageUrl = body.imageUrl.trim();
      if (body.isActive !== undefined) participant.isActive = body.isActive;

      if (body.categorySlugs !== undefined) {
        const categorySlugs = asTrimmedStringArray(body.categorySlugs);
        if (categorySlugs.length > 0) {
          const categories = await CategoryModel.find({
            slug: { $in: categorySlugs.map((slug) => slug.toLowerCase()) },
          });
          if (categories.length > 0) {
            participant.categoryIds = categories.map(
              (category) => category._id,
            );
          }
        }
      }
    }

    await participant.save();
    await participant.populate("categoryIds");

    return jsonResponse({
      success: true,
      participant: serializeParticipant(participant),
    });
  } catch (error) {
    console.error("Failed to update participant", error);
    return serverError("Failed to update participant.");
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminCheck = await verifyAdminRequest(_request);
  if (!adminCheck.ok) return adminCheck.response;

  const { id } = await params;

  try {
    await connectToDatabase();
    const participant = await ParticipantModel.findByIdAndDelete(id);
    if (!participant) return notFound("Participant not found.");

    return jsonResponse({
      success: true,
      message: "Participant deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete participant", error);
    return serverError("Failed to delete participant.");
  }
}
