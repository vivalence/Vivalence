-- CreateIndex
CREATE INDEX "unitIdIndexOnMemoryModel" ON "MemoryModel"("unitId");

-- CreateIndex
CREATE INDEX "userIdIndexOnMemoryModel" ON "MemoryModel"("userId");

-- CreateIndex
CREATE INDEX "unitIdIndexOnPlay" ON "Play"("unitId");

-- CreateIndex
CREATE INDEX "userIdIndexOnPlay" ON "Play"("userId");

-- CreateIndex
CREATE INDEX "gameIdIndexOnPlay" ON "Play"("gameId");

-- CreateIndex
CREATE INDEX "memoryIdIndexOnPlay" ON "Play"("memoryId");

-- CreateIndex
CREATE INDEX "nameIndexOnTag" ON "Tag"("name");

-- CreateIndex
CREATE INDEX "corpusIdIndexOnUnit" ON "Unit"("corpusId");
