CREATE TABLE "integration_credentials" (
  "provider" TEXT NOT NULL,
  "encrypted" TEXT NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "integration_credentials_pkey" PRIMARY KEY ("provider")
);
