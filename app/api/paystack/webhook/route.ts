import { jsonResponse, serverError, verifyPaystackSignature } from "@/lib/api";
import { connectToDatabase } from "@/lib/db";
import { PaymentModel } from "@/models/Payment";
import { ParticipantModel } from "@/models/Participant";

type PaystackWebhookEvent = {
  event?: string;
  data?: {
    reference?: string;
    status?: string;
    gateway_response?: string;
    paid_at?: string;
    channel?: string;
  };
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    if (!verifyPaystackSignature(rawBody, signature)) {
      return jsonResponse(
        {
          success: false,
          message: "Invalid webhook signature.",
        },
        { status: 401 },
      );
    }

    const payload = JSON.parse(rawBody) as PaystackWebhookEvent;
    const reference = payload.data?.reference;

    if (!reference) {
      return jsonResponse(
        {
          success: false,
          message: "Missing payment reference.",
        },
        { status: 400 },
      );
    }

    await connectToDatabase();

    const payment = await PaymentModel.findOne({ reference });
    if (!payment) {
      return jsonResponse(
        {
          success: false,
          message: "Payment not found.",
        },
        { status: 404 },
      );
    }

    if (payment.status === "success") {
      return jsonResponse({
        success: true,
        duplicate: true,
      });
    }

    const nextStatus =
      payload.event === "charge.success" || payload.data?.status === "success"
        ? "success"
        : payload.data?.status === "abandoned"
          ? "abandoned"
          : "failed";

    payment.status = nextStatus;
    payment.gatewayResponse = payload.data?.gateway_response ?? "";
    payment.channel = payload.data?.channel ?? "";
    payment.paidAt = payload.data?.paid_at ? new Date(payload.data.paid_at) : null;

    await payment.save();

    if (nextStatus === "success") {
      await ParticipantModel.findByIdAndUpdate(payment.participantId, {
        $inc: { totalVotes: payment.voteCount },
      });
    }

    return jsonResponse({
      success: true,
    });
  } catch (error) {
    console.error("Failed to process Paystack webhook", error);
    return serverError("Failed to process Paystack webhook.");
  }
}
