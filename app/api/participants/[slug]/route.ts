import { jsonResponse, notFound, serverError } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { serializeParticipant } from "@/lib/voting";
import { ParticipantModel } from "@/models/Participant";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    await connectToDatabase();

    const { slug } = await context.params;
    const participant = await ParticipantModel.findOne({ slug })
      .populate("categoryIds");

    if (!participant) {
      return notFound("Participant not found.");
    }

    return jsonResponse({
      success: true,
      participant: serializeParticipant(participant),
    });
  } catch (error) {
    console.error("Failed to fetch participant", error);
    return serverError("Failed to fetch participant.");
  }
}
