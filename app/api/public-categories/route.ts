import { jsonResponse, serverError } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { serializeCategory } from "@/lib/voting";
import { CategoryModel } from "@/models/Category";
import { ParticipantModel } from "@/models/Participant";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeParticipants = searchParams.get("includeParticipants") === "true";
  const activeOnly = searchParams.get("activeOnly") !== "false";

  try {
    await connectToDatabase();

    const query: Record<string, unknown> = {};
    if (activeOnly) {
      query.isActive = true;
    }

    const categories = await CategoryModel.find(query).sort({ createdAt: -1 }).lean();

    const payload = await Promise.all(
      categories.map(async (category: any) => {
        const serialized = serializeCategory(category);

        if (!includeParticipants) {
          return serialized;
        }

        const participants = await ParticipantModel.find({
          categoryIds: category._id,
          ...(activeOnly ? { isActive: true } : {}),
        })
          .select("name slug imageUrl totalVotes isActive")
          .sort({ totalVotes: -1, name: 1 })
          .lean();

        return {
          ...serialized,
          participants: participants.map((participant: any) => ({
            id: participant._id.toString(),
            name: participant.name,
            slug: participant.slug,
            imageUrl: participant.imageUrl ?? "",
            totalVotes: participant.totalVotes,
            isActive: participant.isActive,
          })),
        };
      }),
    );

    return jsonResponse({
      success: true,
      categories: payload,
    });
  } catch (error) {
    console.error("Failed to fetch categories", error);
    return serverError("Failed to fetch categories.");
  }
}
