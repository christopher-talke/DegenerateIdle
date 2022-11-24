/*
  Warnings:

  - You are about to drop the column `availableFunds` on the `Player` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "BankAccountType" AS ENUM ('SPENDINGS', 'SAVINGS', 'DEPOSIT');

-- CreateEnum
CREATE TYPE "BankAccountStatus" AS ENUM ('OPEN', 'LOCKED');

-- AlterTable
ALTER TABLE "Player" RENAME COLUMN "availableFunds" TO "z_availableFunds";
ALTER TABLE "Player" ALTER COLUMN "z_availableFunds" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "RoulettePlayerBet" ALTER COLUMN "amount" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "WonderwheelPlay" ALTER COLUMN "amount" SET DATA TYPE BIGINT;

-- CreateTable
CREATE TABLE "BankAccount" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'New Account',
    "amount" BIGINT NOT NULL DEFAULT 0,
    "type" "BankAccountType" NOT NULL DEFAULT 'SAVINGS',
    "status" "BankAccountStatus" NOT NULL DEFAULT 'OPEN',
    "lockedTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "playerId" INTEGER NOT NULL,

    CONSTRAINT "BankAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BankAccountTransaction" (
    "id" SERIAL NOT NULL,
    "amount" BIGINT NOT NULL,
    "sourcePlayerId" INTEGER NOT NULL,
    "sourceAccountId" INTEGER NOT NULL,
    "targetAccountId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BankAccountTransaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "BankAccount" ADD CONSTRAINT "BankAccount_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccountTransaction" ADD CONSTRAINT "BankAccountTransaction_sourceAccountId_fkey" FOREIGN KEY ("sourceAccountId") REFERENCES "BankAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccountTransaction" ADD CONSTRAINT "BankAccountTransaction_targetAccountId_fkey" FOREIGN KEY ("targetAccountId") REFERENCES "BankAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BankAccountTransaction" ADD CONSTRAINT "BankAccountTransaction_sourcePlayerId_fkey" FOREIGN KEY ("sourcePlayerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
