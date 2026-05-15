import { CategoryModel } from "@/models/Category";
import { ParticipantModel } from "@/models/Participant";

import { createUniqueSlug, slugifyName } from "@/lib/api";

export async function createCategorySlug(name: string) {
  const baseSlug = slugifyName(name);
  let slug = baseSlug;
  let counter = 1;

  while (await CategoryModel.exists({ slug })) {
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
}

export async function createParticipantSlug(name: string) {
  let slug = createUniqueSlug(name);

  while (await ParticipantModel.exists({ slug })) {
    slug = createUniqueSlug(name);
  }

  return slug;
}

export function serializeCategory(category: {
  _id: { toString(): string };
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    isActive: category.isActive,
    createdAt: category.createdAt ?? null,
    updatedAt: category.updatedAt ?? null,
  };
}

export function serializeParticipant(
  participant: {
    _id: { toString(): string };
    name: string;
    slug: string;
    bio?: string;
    imageUrl?: string;
    isActive: boolean;
    totalVotes: number;
    createdAt?: Date;
    updatedAt?: Date;
    categoryIds?: unknown;
  },
) {
  const categories = Array.isArray(participant.categoryIds)
    ? participant.categoryIds
        .filter(
          (
            item,
          ): item is {
            _id: { toString(): string };
            name: string;
            slug: string;
            description?: string;
            isActive: boolean;
            createdAt?: Date;
            updatedAt?: Date;
          } =>
            typeof item === "object" &&
            item !== null &&
            "_id" in item &&
            "name" in item &&
            "slug" in item &&
            "isActive" in item,
        )
        .map(serializeCategory)
    : [];

  return {
    id: participant._id.toString(),
    name: participant.name,
    slug: participant.slug,
    bio: participant.bio ?? "",
    imageUrl: participant.imageUrl ?? "",
    isActive: participant.isActive,
    totalVotes: participant.totalVotes,
    categories,
    createdAt: participant.createdAt ?? null,
    updatedAt: participant.updatedAt ?? null,
  };
}
