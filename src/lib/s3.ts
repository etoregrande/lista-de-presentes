import { S3Client } from '@aws-sdk/client-s3'

let s3: S3Client | undefined

export function getS3Client(): S3Client {
  const { BUCKET_KEY, BUCKET_SECRET_KEY, BUCKET_REGION } = process.env
  if (!BUCKET_KEY || !BUCKET_SECRET_KEY || !BUCKET_REGION) {
    throw new Error('Missing required environment variables: BUCKET_KEY, BUCKET_SECRET_KEY, or BUCKET_REGION')
  }

  s3 ??= new S3Client({
    credentials: { accessKeyId: BUCKET_KEY, secretAccessKey: BUCKET_SECRET_KEY },
    region: BUCKET_REGION,
  })
  return s3
}
