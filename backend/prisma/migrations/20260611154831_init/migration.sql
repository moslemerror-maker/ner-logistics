-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OPERATOR');

-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('PENDING', 'FILED', 'SETTLED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'OPERATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "gstin" TEXT,
    "pan" TEXT,
    "address" TEXT,
    "plantName" TEXT,
    "stateCode" TEXT,
    "isInterstate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bill" (
    "id" SERIAL NOT NULL,
    "billNumber" TEXT NOT NULL,
    "billDate" TIMESTAMP(3) NOT NULL,
    "clientId" INTEGER NOT NULL,
    "financialYear" TEXT NOT NULL,
    "totalFreight" DECIMAL(12,2) NOT NULL,
    "igst" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "sgst" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "cgst" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "grandTotal" DECIMAL(12,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BillItem" (
    "id" SERIAL NOT NULL,
    "billId" INTEGER NOT NULL,
    "slNo" INTEGER NOT NULL,
    "consignmentNote" TEXT,
    "loadingDate" TIMESTAMP(3),
    "loadingStation" TEXT,
    "deliveryStation" TEXT,
    "challanNo" TEXT,
    "contents" TEXT,
    "packageType" TEXT,
    "truckNumber" TEXT,
    "deliveryDate" TIMESTAMP(3),
    "chargedWeightMt" DECIMAL(10,3),
    "ratePerMt" DECIMAL(10,2),
    "freightAmount" DECIMAL(12,2),

    CONSTRAINT "BillItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Officer" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT,
    "accountReference" TEXT,

    CONSTRAINT "Officer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DispatchRecord" (
    "id" SERIAL NOT NULL,
    "biltySLNo" TEXT,
    "lrNumber" TEXT,
    "billNumber" TEXT,
    "billDate" TIMESTAMP(3),
    "dispatchDate" TIMESTAMP(3),
    "truckNumber" TEXT,
    "loadingPoint" TEXT,
    "destination" TEXT,
    "weightMt" DECIMAL(10,3),
    "freightRate" DECIMAL(10,2),
    "totalFreight" DECIMAL(12,2),
    "cashAdvance" DECIMAL(12,2),
    "dieselAdvance" DECIMAL(12,2),
    "onlineAdvance" DECIMAL(12,2),
    "totalAdvance" DECIMAL(12,2),
    "balance" DECIMAL(12,2),
    "billingRate" DECIMAL(10,2),
    "portalBilling" DECIMAL(12,2),
    "margin" DECIMAL(12,2),
    "pumpName" TEXT,
    "officerId" INTEGER,
    "paymentOfficer" TEXT,
    "bpDate" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DispatchRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NeftPayment" (
    "id" SERIAL NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "biltyNumber" TEXT,
    "vehicleNumber" TEXT,
    "accountNumber" TEXT,
    "beneficiaryName" TEXT,
    "amount" DECIMAL(12,2),
    "ifscCode" TEXT,
    "bankName" TEXT,
    "remarks" TEXT,
    "branchName" TEXT,
    "phoneNumber" TEXT,
    "officerId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NeftPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PumpPayment" (
    "id" SERIAL NOT NULL,
    "paymentDate" TIMESTAMP(3),
    "accountNumber" TEXT,
    "pumpName" TEXT,
    "amount" DECIMAL(12,2),
    "ifscCode" TEXT,
    "bankName" TEXT,
    "location" TEXT,
    "billDated" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PumpPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DamageRecord" (
    "id" SERIAL NOT NULL,
    "incidentDate" TIMESTAMP(3),
    "truckNumber" TEXT,
    "loadingPoint" TEXT,
    "destination" TEXT,
    "totalQty" DECIMAL(10,3),
    "damagedQty" DECIMAL(10,3),
    "advanceLoss" DECIMAL(12,2),
    "damageCost" DECIMAL(12,2),
    "otherExpenses" DECIMAL(12,2),
    "materialTranship" DECIMAL(12,2),
    "cementSale" DECIMAL(12,2),
    "balance" DECIMAL(12,2),
    "claimReceived" DECIMAL(12,2),
    "recoveredFromOfficials" DECIMAL(12,2),
    "lossToRecover" DECIMAL(12,2),
    "dispatchOfficer" TEXT,
    "incidentType" TEXT,
    "claimStatus" "ClaimStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DamageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Bill_billNumber_key" ON "Bill"("billNumber");

-- AddForeignKey
ALTER TABLE "Bill" ADD CONSTRAINT "Bill_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillItem" ADD CONSTRAINT "BillItem_billId_fkey" FOREIGN KEY ("billId") REFERENCES "Bill"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DispatchRecord" ADD CONSTRAINT "DispatchRecord_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "Officer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NeftPayment" ADD CONSTRAINT "NeftPayment_officerId_fkey" FOREIGN KEY ("officerId") REFERENCES "Officer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
