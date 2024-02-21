-- CreateTable
CREATE TABLE "Strategy" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "tactics" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "Strategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_StrategyToUser" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_StrategyToUser_AB_unique" ON "_StrategyToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_StrategyToUser_B_index" ON "_StrategyToUser"("B");

-- AddForeignKey
ALTER TABLE "_StrategyToUser" ADD CONSTRAINT "_StrategyToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Strategy"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StrategyToUser" ADD CONSTRAINT "_StrategyToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("auth_user_id") ON DELETE CASCADE ON UPDATE CASCADE;
