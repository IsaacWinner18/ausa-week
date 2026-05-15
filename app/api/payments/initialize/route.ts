import {
  VOTE_PRICE_NAIRA,
  badRequest,
  isNonEmptyString,
  jsonResponse,
  normalizeEmail,
  parseVoteCount,
  safeJson,
  serverError,
} from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { CategoryModel } from "@/models/Category";
import { ParticipantModel } from "@/models/Participant";
import { PaymentModel } from "@/models/Payment";
import { UserModel } from "@/models/User";

type InitializePaymentBody = {
  email?: string;
  participantSlug?: string;
  categorySlug?: string;
  voteCount?: number | string;
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await safeJson<InitializePaymentBody>(request);
  if (!body) {
    return badRequest("Invalid JSON body.");
  }

  if (!isNonEmptyString(body.email)) {
    return badRequest("Email is required.");
  }

  if (!isNonEmptyString(body.participantSlug)) {
    return badRequest("Participant slug is required.");
  }

  if (!isNonEmptyString(body.categorySlug)) {
    return badRequest("Category slug is required.");
  }

  const voteCount = parseVoteCount(body.voteCount);
  if (!voteCount) {
    return badRequest("voteCount must be a positive integer.");
  }

  try {
    await connectToDatabase();

    const [participant, category] = await Promise.all([
      ParticipantModel.findOne({ slug: body.participantSlug.toLowerCase() }),
      CategoryModel.findOne({ slug: body.categorySlug.toLowerCase() }),
    ]);

    if (!participant) {
      return badRequest("Participant not found.");
    }

    if (!category) {
      return badRequest("Category not found.");
    }

    const belongsToCategory = participant.categoryIds.some(
      (categoryId) => categoryId.toString() === category._id.toString(),
    );

    if (!belongsToCategory) {
      return badRequest("Participant does not belong to the selected category.");
    }

    const email = normalizeEmail(body.email);
    const user = await UserModel.findOneAndUpdate(
      { email },
      { email },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    const amount = voteCount * VOTE_PRICE_NAIRA;
    const reference = `vote_${participant.slug}_${Date.now()}`;

    await PaymentModel.create({
      reference,
      amount,
      voteCount,
      status: "pending",
      userId: user._id,
      participantId: participant._id,
      categoryId: category._id,
      metadata: {
        email,
        participantSlug: participant.slug,
        categorySlug: category.slug,
        votePrice: VOTE_PRICE_NAIRA,
      },
    });

    return jsonResponse({
      success: true,
      payment: {
        reference,
        amount,
        voteCount,
        amountInKobo: amount * 100,
        email,
        participantSlug: participant.slug,
        categorySlug: category.slug,
      },
    });
  } catch (error) {
    console.error("Failed to initialize payment", error);
    return serverError("Failed to initialize payment.");
  }
}
