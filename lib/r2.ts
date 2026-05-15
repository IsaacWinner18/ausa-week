import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Helper to get the clean base endpoint (removing bucket name if present in the string)
const getCleanEndpoint = (endpoint?: string) => {
  if (!endpoint) return "";
  try {
    const url = new URL(endpoint);
    return url.origin;
  } catch (e) {
    return endpoint;
  }
};

const r2Client = new S3Client({
  region: "auto",
  endpoint: getCleanEndpoint(process.env.R2_ENDPOINT),
  forcePathStyle: true, // Required for Cloudflare R2 with account-specific endpoints
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

export async function uploadToR2(file: File, key: string) {
  if (
    !process.env.R2_ENDPOINT ||
    !process.env.R2_ACCESS_KEY_ID ||
    !process.env.R2_SECRET_ACCESS_KEY ||
    !process.env.R2_BUCKET_NAME ||
    !process.env.R2_PUBLIC_URL
  ) {
    console.error(
      "Missing R2 configuration. Required: R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL",
    );
    throw new Error("Missing R2 configuration environment variables");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  console.log(
    `Uploading ${file.name} to R2 bucket ${process.env.R2_BUCKET_NAME} with key: ${key}`,
  );

  try {
    await r2Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: file.type || "application/octet-stream",
      }),
    );

    // Construct the public URL directly
    const publicUrl = process.env.R2_PUBLIC_URL.replace(/\/$/, "");
    const finalUrl = `${publicUrl}/${key.replace(/^\//, "")}`;

    console.log(`Successfully uploaded to R2. Public URL: ${finalUrl}`);
    return finalUrl;
  } catch (error) {
    console.error("R2 Upload Error details:", error);
    throw error;
  }
}
