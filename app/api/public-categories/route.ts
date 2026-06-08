import { jsonResponse, serverError } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { serializeCategory } from "@/lib/voting";
import { CategoryModel } from "@/models/Category";
import { ParticipantModel } from "@/models/Participant";
import mongoose from "mongoose";

export const runtime = "nodejs";

type LeanCategory = Parameters<typeof serializeCategory>[0];

type LeanParticipant = {
  _id: { toString(): string };
  name: string;
  slug: string;
  imageUrl?: string;
  totalVotes: number;
  isActive: boolean;
  categoryIds?: mongoose.Types.ObjectId[] | { toString(): string }[];
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeParticipants =
    searchParams.get("includeParticipants") === "true";
  const activeOnly = searchParams.get("activeOnly") !== "false";

  try {
    await connectToDatabase();

    const query: Record<string, unknown> = {};
    if (activeOnly) {
      query.isActive = true;
    }

    const categories = (await CategoryModel.find(query)
      .sort({ createdAt: -1 })
      .lean()) as LeanCategory[];

    if (!includeParticipants) {
      return jsonResponse({
        success: true,
        categories: categories.map(serializeCategory),
      });
    }

    // Convert ObjectIds to strings for the query
    const categoryIdStrings = categories.map((category) =>
      category._id.toString(),
    );

    const participants = (await ParticipantModel.find({
      categoryIds: { $in: categoryIdStrings },
      ...(activeOnly ? { isActive: true } : {}),
    })
      .select("name slug imageUrl totalVotes isActive categoryIds")
      .sort({ totalVotes: -1, name: 1 })
      .lean()) as LeanParticipant[];

    const participantsByCategoryId = new Map<string, any[]>();

    for (const participant of participants) {
      // Ensure categoryIds is treated as an array
      const categoryIds = participant.categoryIds ?? [];
      for (const categoryId of categoryIds) {
        const key = categoryId.toString();
        const current = participantsByCategoryId.get(key) ?? [];
        current.push({
          id: participant._id.toString(),
          name: participant.name,
          slug: participant.slug,
          imageUrl: participant.imageUrl ?? "",
          totalVotes: participant.totalVotes,
          isActive: participant.isActive,
        });
        participantsByCategoryId.set(key, current);
      }
    }

    const payload = categories.map((category) => ({
      ...serializeCategory(category),
      participants: participantsByCategoryId.get(category._id.toString()) ?? [],
    }));

    return jsonResponse({
      success: true,
      categories: payload,
    });
  } catch (error) {
    console.error("Failed to fetch categories", error);
    return serverError("Failed to fetch categories.");
  }
}
