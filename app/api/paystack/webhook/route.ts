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
      console.error("Invalid webhook signature.");
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

    const nextStatus =
      payload.event === "charge.success" || payload.data?.status === "success"
        ? "success"
        : payload.data?.status === "abandoned"
          ? "abandoned"
          : "failed";

    const updatedPayment = await PaymentModel.findOneAndUpdate(
      {
        reference,
        status: { $ne: "success" }, 
      },
      {
        $set: {
          status: nextStatus,
          gatewayResponse: payload.data?.gateway_response ?? "",
          channel: payload.data?.channel ?? "",
          paidAt: payload.data?.paid_at ? new Date(payload.data.paid_at) : null,
        },
      },
      { new: true },
    );

    // If no document was updated, it's either a duplicate or the reference doesn't exist
    if (!updatedPayment) {
      const existingPayment = await PaymentModel.findOne({ reference });
      
      if (existingPayment?.status === "success") {
        return jsonResponse({ success: true, duplicate: true });
      }

      return jsonResponse(
        { success: false, message: "Payment not found or already processed." },
        { status: 404 },
      );
    }

    // Only increment votes if the transition TO success just happened
    if (nextStatus === "success") {
      await ParticipantModel.findByIdAndUpdate(updatedPayment.participantId, {
        $inc: { totalVotes: updatedPayment.voteCount },
      });
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error("Failed to process Paystack webhook", error);
    return serverError("Failed to process Paystack webhook.");
  }
}
