-- Add SUPER_ADMIN to Role enum
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN' BEFORE 'ADMIN';

-- Drop old email column and add username
ALTER TABLE "User" DROP COLUMN IF EXISTS "email";
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "username" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Back-fill username from existing rows (safety net if any rows exist)
UPDATE "User" SET "username" = 'user_' || id WHERE "username" IS NULL;

-- Make username NOT NULL and unique
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;
ALTER TABLE "User" ADD CONSTRAINT "User_username_key" UNIQUE ("username");
