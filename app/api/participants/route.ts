import type { NextRequest } from "next/server";

import { jsonResponse, serverError } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { serializeParticipant } from "@/lib/voting";
import { CategoryModel } from "@/models/Category";
import { ParticipantModel } from "@/models/Participant";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.searchParams.get("search")?.trim();
  const categorySlug = request.nextUrl.searchParams.get("category")?.trim();
  const activeOnly = request.nextUrl.searchParams.get("activeOnly") !== "false";

  try {
    await connectToDatabase();

    const query: Record<string, unknown> = {};

    if (activeOnly) {
      query.isActive = true;
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (categorySlug) {
      const category = await CategoryModel.findOne({ slug: categorySlug.toLowerCase() });
      if (!category) {
        return jsonResponse({
          success: true,
          participants: [],
        });
      }

      query.categoryIds = category._id;
    }

    const participants = await ParticipantModel.find(query)
      .populate("categoryIds")
      .sort({ totalVotes: -1, createdAt: -1 });

    return jsonResponse({
      success: true,
      participants: participants.map(serializeParticipant),
    });
  } catch (error) {
    console.error("Failed to fetch participants", error);
    return serverError("Failed to fetch participants.");
  }
}
