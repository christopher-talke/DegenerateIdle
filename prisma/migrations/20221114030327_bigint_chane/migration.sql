-- CreateEnum
CREATE TYPE "RoulettePlayerPlayState" AS ENUM ('PENDING', 'WON', 'LOST', 'CANCELLED');

-- CreateEnum
CREATE TYPE "RoulettePlayState" AS ENUM ('PENDING', 'LOCKED', 'FINAL');

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "discordId" VARCHAR(255) NOT NULL,
    "availableFunds" INTEGER NOT NULL DEFAULT 100000,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoulettePlayerBet" (
    "id" SERIAL NOT NULL,
    "bet" VARCHAR(255) NOT NULL,
    "amount" BIGINT NOT NULL,
    "result" BIGINT NOT NULL DEFAULT 0,
    "state" "RoulettePlayerPlayState" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "playerId" INTEGER NOT NULL,
    "roulettePlayId" INTEGER NOT NULL,

    CONSTRAINT "RoulettePlayerBet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoulettePlay" (
    "id" SERIAL NOT NULL,
    "winningNumber" INTEGER,
    "state" "RoulettePlayState" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),

    CONSTRAINT "RoulettePlay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlayerOnRoulettePlay" (
    "playerId" INTEGER NOT NULL,
    "roulettePlayId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlayerOnRoulettePlay_pkey" PRIMARY KEY ("playerId","roulettePlayId")
);

-- CreateTable
CREATE TABLE "WonderwheelPlay" (
    "id" SERIAL NOT NULL,
    "prize" BIGINT NOT NULL,
    "multiplier" BIGINT NOT NULL,
    "amount" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "playerId" INTEGER NOT NULL,

    CONSTRAINT "WonderwheelPlay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PlayerToRoulettePlay" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_PlayerToRoulettePlay_AB_unique" ON "_PlayerToRoulettePlay"("A", "B");

-- CreateIndex
CREATE INDEX "_PlayerToRoulettePlay_B_index" ON "_PlayerToRoulettePlay"("B");

-- AddForeignKey
ALTER TABLE "RoulettePlayerBet" ADD CONSTRAINT "RoulettePlayerBet_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoulettePlayerBet" ADD CONSTRAINT "RoulettePlayerBet_roulettePlayId_fkey" FOREIGN KEY ("roulettePlayId") REFERENCES "RoulettePlay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerOnRoulettePlay" ADD CONSTRAINT "PlayerOnRoulettePlay_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerOnRoulettePlay" ADD CONSTRAINT "PlayerOnRoulettePlay_roulettePlayId_fkey" FOREIGN KEY ("roulettePlayId") REFERENCES "RoulettePlay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WonderwheelPlay" ADD CONSTRAINT "WonderwheelPlay_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerToRoulettePlay" ADD CONSTRAINT "_PlayerToRoulettePlay_A_fkey" FOREIGN KEY ("A") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PlayerToRoulettePlay" ADD CONSTRAINT "_PlayerToRoulettePlay_B_fkey" FOREIGN KEY ("B") REFERENCES "RoulettePlay"("id") ON DELETE CASCADE ON UPDATE CASCADE;
