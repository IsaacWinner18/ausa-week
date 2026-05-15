import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const paymentSchema = new Schema(
  {
    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    provider: {
      type: String,
      required: true,
      default: "paystack",
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      default: "NGN",
    },
    voteCount: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      required: true,
      enum: ["initialized", "pending", "success", "failed", "abandoned"],
      default: "initialized",
    },
    gatewayResponse: {
      type: String,
      default: "",
    },
    paidAt: {
      type: Date,
      default: null,
    },
    channel: {
      type: String,
      default: "",
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participantId: {
      type: Schema.Types.ObjectId,
      ref: "Participant",
      required: true,
    },
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index({ userId: 1, participantId: 1, categoryId: 1 });
paymentSchema.index({ status: 1 });

export type PaymentDocument = InferSchemaType<typeof paymentSchema>;

export const PaymentModel =
  (models.Payment as Model<PaymentDocument>) ||
  model<PaymentDocument>("Payment", paymentSchema);
