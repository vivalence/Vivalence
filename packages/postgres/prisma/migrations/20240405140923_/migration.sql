-- CreateTable
CREATE TABLE "_StrategyToUnit" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_StrategyToUnit_AB_unique" ON "_StrategyToUnit"("A", "B");

-- CreateIndex
CREATE INDEX "_StrategyToUnit_B_index" ON "_StrategyToUnit"("B");

-- AddForeignKey
ALTER TABLE "_StrategyToUnit" ADD CONSTRAINT "_StrategyToUnit_A_fkey" FOREIGN KEY ("A") REFERENCES "Strategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StrategyToUnit" ADD CONSTRAINT "_StrategyToUnit_B_fkey" FOREIGN KEY ("B") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
