import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const participantSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    bio: {
      type: String,
      trim: true,
      default: "",
    },
    imageUrl: {
      type: String,
      trim: true,
      default: "",
    },
    categoryIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    totalVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

participantSchema.index({ name: 1 });
participantSchema.index({ categoryIds: 1 });

export type ParticipantDocument = InferSchemaType<typeof participantSchema>;

export const ParticipantModel =
  (models.Participant as Model<ParticipantDocument>) ||
  model<ParticipantDocument>("Participant", participantSchema);
