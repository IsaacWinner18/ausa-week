import crypto from "node:crypto";

import type { NextRequest } from "next/server";

export const VOTE_PRICE_NAIRA = 200;

export function jsonResponse(
  data: unknown,
  init?: ResponseInit,
) {
  return Response.json(data, init);
}

export function badRequest(message: string, details?: unknown) {
  return jsonResponse(
    {
      success: false,
      message,
      details,
    },
    { status: 400 },
  );
}

export function unauthorized(message = "Unauthorized") {
  return jsonResponse(
    {
      success: false,
      message,
    },
    { status: 401 },
  );
}

export function notFound(message: string) {
  return jsonResponse(
    {
      success: false,
      message,
    },
    { status: 404 },
  );
}

export function serverError(message = "Something went wrong") {
  return jsonResponse(
    {
      success: false,
      message,
    },
    { status: 500 },
  );
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function slugifyName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function createUniqueSlug(name: string) {
  const base = slugifyName(name);
  const suffix = crypto.randomBytes(3).toString("base64url").slice(0, 4);
  return `${base}-${suffix.toLowerCase()}`;
}

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function asTrimmedStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseVoteCount(value: unknown) {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export async function verifyAdminRequest(request: NextRequest) {
  // 1. Check for API Key (for external programmatic access)
  const adminKey = process.env.ADMIN_API_KEY;
  const requestKey = request.headers.get("x-admin-key");

  if (adminKey && requestKey === adminKey) {
    return { ok: true as const };
  }

  // 2. Check for Admin Session (for internal dashboard access)
  try {
    const { getCurrentAdminUser } = await import("@/lib/admin");
    const user = await getCurrentAdminUser();

    if (user && user.isAdmin && user.adminStatus === "approved") {
      return { ok: true as const };
    }
  } catch (error) {
    console.error("Session verification failed:", error);
  }

  // If both fail, return unauthorized
  return {
    ok: false,
    response: unauthorized("Unauthorized access. Provide a valid admin key or log in."),
  };
}

export async function safeJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export function verifyPaystackSignature(rawBody: string, signature: string | null) {
  const secret = process.env.PAYSTACK_SECRET_KEY;

  if (!secret || !signature) {
    return false;
  }

  const digest = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");

  return digest === signature;
}
