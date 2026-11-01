-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR', 'SALES');

-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('QUOTE', 'DEMO', 'CONTACT', 'PARTNER');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST', 'CLOSED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EDITOR',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Solution" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "features" JSONB NOT NULL DEFAULT '[]',
    "highlights" TEXT[],
    "audiences" TEXT[],
    "faqs" JSONB NOT NULL DEFAULT '[]',
    "appUrl" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Solution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT,
    "specs" JSONB NOT NULL DEFAULT '[]',
    "options" JSONB NOT NULL DEFAULT '[]',
    "customizable" BOOLEAN NOT NULL DEFAULT false,
    "customizationNote" TEXT,
    "moq" INTEGER NOT NULL DEFAULT 1,
    "unit" TEXT NOT NULL DEFAULT 'piece',
    "priceTiers" JSONB NOT NULL DEFAULT '[]',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "points" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "ref" TEXT NOT NULL,
    "type" "LeadType" NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "name" TEXT NOT NULL,
    "institution" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "city" TEXT,
    "message" TEXT,
    "solutionId" TEXT,
    "preferredDate" TIMESTAMP(3),
    "items" JSONB,
    "source" JSONB,
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadNote" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "authorId" TEXT,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadNote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "Setting_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Solution_slug_key" ON "Solution"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_slug_key" ON "ProductCategory"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");

-- CreateIndex
CREATE INDEX "Product_categoryId_idx" ON "Product"("categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Lead_ref_key" ON "Lead"("ref");

-- CreateIndex
CREATE INDEX "Lead_type_status_idx" ON "Lead"("type", "status");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "LeadNote_leadId_idx" ON "LeadNote"("leadId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_solutionId_fkey" FOREIGN KEY ("solutionId") REFERENCES "Solution"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadNote" ADD CONSTRAINT "LeadNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

