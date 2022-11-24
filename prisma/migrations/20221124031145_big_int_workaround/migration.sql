-- AlterTable
ALTER TABLE "BankAccount" ALTER COLUMN "amount" SET DEFAULT '100000',
ALTER COLUMN "amount" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "BankAccountTransaction" ALTER COLUMN "amount" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Player" ALTER COLUMN "z_availableFunds" SET DEFAULT '100000',
ALTER COLUMN "z_availableFunds" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "RoulettePlayerBet" ALTER COLUMN "amount" SET DEFAULT '100000',
ALTER COLUMN "amount" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "WonderwheelPlay" ALTER COLUMN "amount" SET DEFAULT '100000',
ALTER COLUMN "amount" SET DATA TYPE TEXT;
