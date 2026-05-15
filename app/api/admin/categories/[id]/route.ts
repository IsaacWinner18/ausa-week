import type { NextRequest } from "next/server";
import {
  badRequest,
  jsonResponse,
  notFound,
  safeJson,
  serverError,
  verifyAdminRequest,
} from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { serializeCategory } from "@/lib/voting";
import { CategoryModel } from "@/models/Category";
import { ParticipantModel } from "@/models/Participant";

export const runtime = "nodejs";

type UpdateCategoryBody = {
  name?: string;
  description?: string;
  isActive?: boolean;
};

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const adminCheck = await verifyAdminRequest(request);
  if (!adminCheck.ok) return adminCheck.response;

  const { id } = await params;
  const body = await safeJson<UpdateCategoryBody>(request);
  if (!body) return badRequest("Invalid JSON body.");

  try {
    await connectToDatabase();
    const category = await CategoryModel.findById(id);
    if (!category) return notFound("Category not found.");

    if (body.name !== undefined) category.name = body.name.trim();
    if (body.description !== undefined)
      category.description = body.description.trim();
    if (body.isActive !== undefined) category.isActive = body.isActive;

    await category.save();

    return jsonResponse({
      success: true,
      category: serializeCategory(category),
    });
  } catch (error) {
    console.error("Failed to update category", error);
    return serverError("Failed to update category.");
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

    // Check for participants
    const participantsCount = await ParticipantModel.countDocuments({
      categoryIds: id,
    });
    if (participantsCount > 0) {
      return badRequest("Cannot delete category with active participants.");
    }

    const category = await CategoryModel.findByIdAndDelete(id);
    if (!category) return notFound("Category not found.");

    return jsonResponse({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error("Failed to delete category", error);
    return serverError("Failed to delete category.");
  }
}
