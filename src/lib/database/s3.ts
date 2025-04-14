import "dotenv/config";
import { S3Client, ListBucketsCommand } from "@aws-sdk/client-s3";

if (
  !process.env.BUCKET_KEY ||
  !process.env.BUCKET_SECRET_KEY ||
  !process.env.BUCKET_REGION
) {
  throw new Error(
    "Missing required environment variables: BUCKET_KEY, BUCKET_SECRET_KEY, or BUCKET_REGION",
  );
}

export const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.BUCKET_KEY,
    secretAccessKey: process.env.BUCKET_SECRET_KEY,
  },
  region: process.env.BUCKET_REGION,
});
