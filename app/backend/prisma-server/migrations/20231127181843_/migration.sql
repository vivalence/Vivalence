-- CreateTable
CREATE TABLE "UnitUserRelation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "UnitStatusEnum" NOT NULL DEFAULT 'UNKNOWN',
    "state" JSONB NOT NULL,
    "unitId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "UnitUserRelation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnitUserRelation_unitId_userId_key" ON "UnitUserRelation"("unitId", "userId");

-- AddForeignKey
ALTER TABLE "UnitUserRelation" ADD CONSTRAINT "UnitUserRelation_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UnitUserRelation" ADD CONSTRAINT "UnitUserRelation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
