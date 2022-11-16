/*
  Warnings:

  - You are about to alter the column `amount` on the `RoulettePlayerBet` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `result` on the `RoulettePlayerBet` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `prize` on the `WonderwheelPlay` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `multiplier` on the `WonderwheelPlay` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `amount` on the `WonderwheelPlay` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "RoulettePlayerBet" ALTER COLUMN "amount" SET DATA TYPE INTEGER,
ALTER COLUMN "result" SET DATA TYPE INTEGER;

-- AlterTable
ALTER TABLE "WonderwheelPlay" ALTER COLUMN "prize" SET DATA TYPE INTEGER,
ALTER COLUMN "multiplier" SET DATA TYPE INTEGER,
ALTER COLUMN "amount" SET DATA TYPE INTEGER;
