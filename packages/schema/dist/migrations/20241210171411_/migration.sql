-- CreateEnum
CREATE TYPE "UserRolesEnum" AS ENUM ('ADMIN', 'USER', 'GUEST');

-- CreateEnum
CREATE TYPE "StrategyTraitsEnum" AS ENUM ('DUMMY');

-- CreateEnum
CREATE TYPE "TagTraitsEnum" AS ENUM ('ONTOLOGICAL', 'STRUCTURAL', 'LEARNABLE', 'COMPLETABLE');

-- CreateEnum
CREATE TYPE "MemoryFlavorEnum" AS ENUM ('INDIVIDUAL', 'RELATIONAL');

-- CreateEnum
CREATE TYPE "MemoryStatusEnum" AS ENUM ('UNTOUCHED', 'UNKNOWN', 'LEARNING', 'KNOWN', 'GRADUATED');

-- CreateEnum
CREATE TYPE "QueueStatusEnum" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "roles" "UserRolesEnum"[] DEFAULT ARRAY['USER']::"UserRolesEnum"[],
    "config" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Runtime" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "slug" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '0.0.0',
    "installed" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "description" TEXT,
    "icon" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Runtime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Domain" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "slug" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '0.0.0',
    "installed" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "runtimeId" TEXT NOT NULL,

    CONSTRAINT "Domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ontology" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "slug" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '0.0.0',
    "installed" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "runtimeId" TEXT NOT NULL,

    CONSTRAINT "Ontology_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Strategy" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "slug" TEXT NOT NULL DEFAULT '',
    "version" TEXT NOT NULL DEFAULT '0.0.0',
    "installed" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "runtimeId" TEXT NOT NULL,
    "traits" "StrategyTraitsEnum"[] DEFAULT ARRAY[]::"StrategyTraitsEnum"[],
    "data" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Strategy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Corpus" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "slug" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '0.0.0',
    "installed" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "description" TEXT,
    "icon" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "runtimeId" TEXT NOT NULL,

    CONSTRAINT "Corpus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "slug" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '0.0.0',
    "installed" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "runtimeId" TEXT NOT NULL,
    "mask" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tactic" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "slug" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '0.0.0',
    "installed" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "runtimeId" TEXT NOT NULL,
    "relations" JSONB NOT NULL DEFAULT '{}',
    "masks" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Tactic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "runtimeId" TEXT NOT NULL,
    "corpusId" TEXT,
    "annotation" JSONB NOT NULL DEFAULT '{}',
    "data" JSONB NOT NULL DEFAULT '{}',
    "index" INTEGER,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "runtimeId" TEXT NOT NULL,
    "corpusId" TEXT,
    "traits" "TagTraitsEnum"[] DEFAULT ARRAY[]::"TagTraitsEnum"[],
    "data" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Dependency" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "runtimeId" TEXT NOT NULL,
    "corpusId" TEXT,
    "itinerary" JSONB NOT NULL DEFAULT '{}',
    "available" BOOLEAN NOT NULL DEFAULT false,
    "satisfied" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Dependency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Condition" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "name" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "runtimeId" TEXT NOT NULL,
    "corpusId" TEXT,
    "scope" JSONB NOT NULL DEFAULT '{}',
    "assertion" JSONB NOT NULL DEFAULT '{}',
    "met" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Condition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Play" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "runtimeId" TEXT NOT NULL,
    "gameId" TEXT NOT NULL,
    "tacticId" TEXT,
    "unitId" TEXT,
    "tagId" TEXT,
    "memoryId" TEXT NOT NULL,
    "history" JSONB NOT NULL DEFAULT '[]',
    "signal" JSONB NOT NULL DEFAULT '{}',
    "nextIn" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "nextAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Play_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Memory" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "runtimeId" TEXT NOT NULL,
    "tagId" TEXT,
    "unitId" TEXT,
    "type" TEXT NOT NULL DEFAULT 'BAYESIAN',
    "flavor" "MemoryFlavorEnum" NOT NULL DEFAULT 'INDIVIDUAL',
    "status" "MemoryStatusEnum" NOT NULL DEFAULT 'UNKNOWN',
    "state" JSONB NOT NULL DEFAULT '{}',
    "history" JSONB NOT NULL DEFAULT '[]',
    "signal" JSONB NOT NULL DEFAULT '{}',
    "nextIn" DECIMAL(65,30) NOT NULL DEFAULT 0.0,
    "nextAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Memory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Queue" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "runtimeId" TEXT NOT NULL,
    "gameId" TEXT,
    "tacticId" TEXT,
    "dependencyId" TEXT,
    "index" INTEGER NOT NULL DEFAULT 0,
    "status" "QueueStatusEnum" NOT NULL DEFAULT 'PENDING',
    "data" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "Queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HEAD" (
    "id" TEXT NOT NULL DEFAULT uuid_generate_v4(),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "runtimeId" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "HEAD_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_RuntimeToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_TagToUnit" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Condition" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_Precondition" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Runtime_slug_key" ON "Runtime"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_runtimeId_key" ON "Domain"("runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "Domain_slug_runtimeId_key" ON "Domain"("slug", "runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "Ontology_runtimeId_key" ON "Ontology"("runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "Ontology_slug_runtimeId_key" ON "Ontology"("slug", "runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "Strategy_slug_runtimeId_key" ON "Strategy"("slug", "runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "Corpus_slug_runtimeId_key" ON "Corpus"("slug", "runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "Game_slug_runtimeId_key" ON "Game"("slug", "runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "Tactic_slug_runtimeId_key" ON "Tactic"("slug", "runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_slug_runtimeId_key" ON "Unit"("slug", "runtimeId");

-- CreateIndex
CREATE INDEX "nameIndexOnTag" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_runtimeId_key" ON "Tag"("slug", "runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "Dependency_slug_runtimeId_key" ON "Dependency"("slug", "runtimeId");

-- CreateIndex
CREATE INDEX "userIdIndexOnPlay" ON "Play"("userId");

-- CreateIndex
CREATE INDEX "gameIdIndexOnPlay" ON "Play"("gameId");

-- CreateIndex
CREATE INDEX "tacticIdIndexOnPlay" ON "Play"("tacticId");

-- CreateIndex
CREATE INDEX "unitIdIndexOnPlay" ON "Play"("unitId");

-- CreateIndex
CREATE INDEX "tagIdIndexOnPlay" ON "Play"("tagId");

-- CreateIndex
CREATE INDEX "memoryIdIndexOnPlay" ON "Play"("memoryId");

-- CreateIndex
CREATE UNIQUE INDEX "Play_userId_unitId_tagId_gameId_tacticId_key" ON "Play"("userId", "unitId", "tagId", "gameId", "tacticId");

-- CreateIndex
CREATE INDEX "unitIdIndexOnMemory" ON "Memory"("unitId");

-- CreateIndex
CREATE INDEX "userIdIndexOnMemory" ON "Memory"("userId");

-- CreateIndex
CREATE INDEX "tagIdIndexOnMemory" ON "Memory"("tagId");

-- CreateIndex
CREATE UNIQUE INDEX "Memory_unitId_userId_tagId_key" ON "Memory"("unitId", "userId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "HEAD_runtimeId_key" ON "HEAD"("runtimeId");

-- CreateIndex
CREATE UNIQUE INDEX "_RuntimeToUser_AB_unique" ON "_RuntimeToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RuntimeToUser_B_index" ON "_RuntimeToUser"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TagToUnit_AB_unique" ON "_TagToUnit"("A", "B");

-- CreateIndex
CREATE INDEX "_TagToUnit_B_index" ON "_TagToUnit"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Condition_AB_unique" ON "_Condition"("A", "B");

-- CreateIndex
CREATE INDEX "_Condition_B_index" ON "_Condition"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_Precondition_AB_unique" ON "_Precondition"("A", "B");

-- CreateIndex
CREATE INDEX "_Precondition_B_index" ON "_Precondition"("B");

-- AddForeignKey
ALTER TABLE "Domain" ADD CONSTRAINT "Domain_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ontology" ADD CONSTRAINT "Ontology_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Strategy" ADD CONSTRAINT "Strategy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Strategy" ADD CONSTRAINT "Strategy_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Corpus" ADD CONSTRAINT "Corpus_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tactic" ADD CONSTRAINT "Tactic_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Unit" ADD CONSTRAINT "Unit_corpusId_fkey" FOREIGN KEY ("corpusId") REFERENCES "Corpus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_corpusId_fkey" FOREIGN KEY ("corpusId") REFERENCES "Corpus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dependency" ADD CONSTRAINT "Dependency_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dependency" ADD CONSTRAINT "Dependency_corpusId_fkey" FOREIGN KEY ("corpusId") REFERENCES "Corpus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_corpusId_fkey" FOREIGN KEY ("corpusId") REFERENCES "Corpus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_tacticId_fkey" FOREIGN KEY ("tacticId") REFERENCES "Tactic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Play" ADD CONSTRAINT "Play_memoryId_fkey" FOREIGN KEY ("memoryId") REFERENCES "Memory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Memory" ADD CONSTRAINT "Memory_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_tacticId_fkey" FOREIGN KEY ("tacticId") REFERENCES "Tactic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Queue" ADD CONSTRAINT "Queue_dependencyId_fkey" FOREIGN KEY ("dependencyId") REFERENCES "Dependency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HEAD" ADD CONSTRAINT "HEAD_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HEAD" ADD CONSTRAINT "HEAD_runtimeId_fkey" FOREIGN KEY ("runtimeId") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RuntimeToUser" ADD CONSTRAINT "_RuntimeToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Runtime"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_RuntimeToUser" ADD CONSTRAINT "_RuntimeToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToUnit" ADD CONSTRAINT "_TagToUnit_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToUnit" ADD CONSTRAINT "_TagToUnit_B_fkey" FOREIGN KEY ("B") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Condition" ADD CONSTRAINT "_Condition_A_fkey" FOREIGN KEY ("A") REFERENCES "Condition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Condition" ADD CONSTRAINT "_Condition_B_fkey" FOREIGN KEY ("B") REFERENCES "Dependency"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Precondition" ADD CONSTRAINT "_Precondition_A_fkey" FOREIGN KEY ("A") REFERENCES "Condition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Precondition" ADD CONSTRAINT "_Precondition_B_fkey" FOREIGN KEY ("B") REFERENCES "Dependency"("id") ON DELETE CASCADE ON UPDATE CASCADE;
