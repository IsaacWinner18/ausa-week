import type { NextRequest } from "next/server";

import {
  badRequest,
  jsonResponse,
  isNonEmptyString,
  safeJson,
  serverError,
  verifyAdminRequest,
} from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { createCategorySlug, serializeCategory } from "@/lib/voting";
import { CategoryModel } from "@/models/Category";

type CreateCategoryBody = {
  name?: string;
  description?: string;
  isActive?: boolean;
};

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const adminCheck = await verifyAdminRequest(request);
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const body = await safeJson<CreateCategoryBody>(request);
  if (!body) {
    return badRequest("Invalid JSON body.");
  }

  if (!isNonEmptyString(body.name)) {
    return badRequest("Category name is required.");
  }

  try {
    await connectToDatabase();

    const slug = await createCategorySlug(body.name);
    const category = await CategoryModel.create({
      name: body.name.trim(),
      slug,
      description:
        typeof body.description === "string" ? body.description.trim() : "",
      isActive: typeof body.isActive === "boolean" ? body.isActive : true,
    });

    return jsonResponse(
      {
        success: true,
        category: serializeCategory(category),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to create category", error);
    return serverError("Failed to create category.");
  }
}
