import "server-only";

import { cache } from "react";

import { redirect } from "next/navigation";

import { connectToDatabase } from "@/lib/db";
import { getAdminSession } from "@/lib/session";
import { CategoryModel } from "@/models/Category";
import { PaymentModel } from "@/models/Payment";
import { ParticipantModel } from "@/models/Participant";
import { UserModel } from "@/models/User";

function getPopulatedValue(
  value: unknown,
  keys: string[],
): Record<string, unknown> | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  return keys.every((key) => key in record) ? record : null;
}

export const getCurrentAdminUser = cache(async () => {
  const session = await getAdminSession();

  if (!session?.userId) {
    return null;
  }

  await connectToDatabase();

  const user = await UserModel.findById(session.userId)
    .populate("approvedByUserId", "name email")
    .lean();

  if (!user) {
    return null;
  }

  return {
    id: user._id.toString(),
    name: user.name ?? "",
    email: user.email,
    isAdmin: user.isAdmin,
    adminStatus: user.adminStatus,
    approvedAt: user.approvedAt ?? null,
    approvedBy:
      getPopulatedValue(user.approvedByUserId, ["_id", "email"])
        ? {
            id: String(
              getPopulatedValue(user.approvedByUserId, ["_id", "email"])?._id,
            ),
            name: String(
              getPopulatedValue(user.approvedByUserId, ["_id", "email"])?.name ?? "",
            ),
            email: String(
              getPopulatedValue(user.approvedByUserId, ["_id", "email"])?.email ?? "",
            ),
          }
        : null,
  };
});

export async function requireSignedInAdmin() {
  const user = await getCurrentAdminUser();

  if (!user) {
    redirect("/admin/login");
  }

  return user;
}

export async function requireApprovedAdmin() {
  const user = await requireSignedInAdmin();

  if (!user.isAdmin || user.adminStatus !== "approved") {
    redirect("/admin");
  }

  return user;
}

export async function getAdminDashboardData() {
  await connectToDatabase();

  const [
    totalCategories,
    totalParticipants,
    pendingAdmins,
    totalAdmins,
    successfulPayments,
    recentPayments,
    adminRequests,
    allAdmins,
  ] = await Promise.all([
    CategoryModel.countDocuments(),
    ParticipantModel.countDocuments(),
    UserModel.countDocuments({ adminStatus: "pending" }),
    UserModel.countDocuments({ isAdmin: true, adminStatus: "approved" }),
    PaymentModel.find({ status: "success" })
      .sort({ updatedAt: -1 })
      .populate("userId", "email")
      .populate("participantId", "name slug")
      .populate("categoryId", "name slug")
      .lean(),
    PaymentModel.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("userId", "email")
      .populate("participantId", "name slug")
      .populate("categoryId", "name slug")
      .lean(),
    UserModel.find({ adminStatus: "pending" }).sort({ createdAt: -1 }).lean(),
    UserModel.find({ adminStatus: { $in: ["approved", "pending", "rejected"] } })
      .sort({ createdAt: -1 })
      .populate("approvedByUserId", "name email")
      .lean(),
  ]);

  const totalRevenue = successfulPayments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  );
  const totalVotesSold = successfulPayments.reduce(
    (sum, payment) => sum + payment.voteCount,
    0,
  );

  return {
    stats: {
      totalCategories,
      totalParticipants,
      pendingAdmins,
      totalAdmins,
      totalRevenue,
      totalVotesSold,
      successfulPayments: successfulPayments.length,
    },
    recentPayments: recentPayments.map((payment) => ({
      id: payment._id.toString(),
      reference: payment.reference,
      amount: payment.amount,
      voteCount: payment.voteCount,
      status: payment.status,
      email:
        getPopulatedValue(payment.userId, ["email"])
          ? String(getPopulatedValue(payment.userId, ["email"])?.email ?? "")
          : "",
      participant:
        getPopulatedValue(payment.participantId, ["name"])
          ? {
              name: String(
                getPopulatedValue(payment.participantId, ["name"])?.name ?? "",
              ),
              slug: String(
                getPopulatedValue(payment.participantId, ["name"])?.slug ?? "",
              ),
            }
          : null,
      category:
        getPopulatedValue(payment.categoryId, ["name"])
          ? {
              name: String(
                getPopulatedValue(payment.categoryId, ["name"])?.name ?? "",
              ),
              slug: String(
                getPopulatedValue(payment.categoryId, ["name"])?.slug ?? "",
              ),
            }
          : null,
      createdAt: payment.createdAt ?? null,
    })),
    adminRequests: adminRequests.map((user) => ({
      id: user._id.toString(),
      name: user.name ?? "",
      email: user.email,
      createdAt: user.createdAt ?? null,
    })),
    admins: allAdmins.map((user) => ({
      id: user._id.toString(),
      name: user.name ?? "",
      email: user.email,
      isAdmin: user.isAdmin,
      adminStatus: user.adminStatus,
      approvedAt: user.approvedAt ?? null,
      approvedBy:
        getPopulatedValue(user.approvedByUserId, ["email"])
          ? {
              name: String(
                getPopulatedValue(user.approvedByUserId, ["email"])?.name ?? "",
              ),
              email: String(
                getPopulatedValue(user.approvedByUserId, ["email"])?.email ?? "",
              ),
            }
          : null,
    })),
  };
}
