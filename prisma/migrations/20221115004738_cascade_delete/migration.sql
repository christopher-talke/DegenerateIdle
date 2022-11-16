-- DropForeignKey
ALTER TABLE "PlayerOnRoulettePlay" DROP CONSTRAINT "PlayerOnRoulettePlay_playerId_fkey";

-- DropForeignKey
ALTER TABLE "PlayerOnRoulettePlay" DROP CONSTRAINT "PlayerOnRoulettePlay_roulettePlayId_fkey";

-- DropForeignKey
ALTER TABLE "RoulettePlayerBet" DROP CONSTRAINT "RoulettePlayerBet_playerId_fkey";

-- DropForeignKey
ALTER TABLE "RoulettePlayerBet" DROP CONSTRAINT "RoulettePlayerBet_roulettePlayId_fkey";

-- DropForeignKey
ALTER TABLE "WonderwheelPlay" DROP CONSTRAINT "WonderwheelPlay_playerId_fkey";

-- AddForeignKey
ALTER TABLE "RoulettePlayerBet" ADD CONSTRAINT "RoulettePlayerBet_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoulettePlayerBet" ADD CONSTRAINT "RoulettePlayerBet_roulettePlayId_fkey" FOREIGN KEY ("roulettePlayId") REFERENCES "RoulettePlay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerOnRoulettePlay" ADD CONSTRAINT "PlayerOnRoulettePlay_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlayerOnRoulettePlay" ADD CONSTRAINT "PlayerOnRoulettePlay_roulettePlayId_fkey" FOREIGN KEY ("roulettePlayId") REFERENCES "RoulettePlay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WonderwheelPlay" ADD CONSTRAINT "WonderwheelPlay_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
