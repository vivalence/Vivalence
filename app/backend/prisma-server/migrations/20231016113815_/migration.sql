-- CreateEnum
CREATE TYPE "GameTypeEnum" AS ENUM ('FLASHCARDS');

-- CreateEnum
CREATE TYPE "UnitStatusEnum" AS ENUM ('HIDDEN', 'UNKNOW', 'PRIORITIZED', 'LEARNING', 'KNOWN');

-- CreateEnum
CREATE TYPE "CorpusTypeEnum" AS ENUM ('WORD', 'VERB_CONJUGATION', 'VERB_STEM', 'VERB_ENDING');

-- CreateEnum
CREATE TYPE "MoodEnum" AS ENUM ('INDICATIVO', 'SUBJUNTIVO', 'IMPERATIVO_AFIRMATIVO', 'IMPERATIVO_NEGATIVO', 'NON_FINITE');

-- CreateEnum
CREATE TYPE "TenseEnum" AS ENUM ('INFINITIVO', 'GERUNDIO', 'PARTICIPIO', 'PRESENTE', 'PRETERITO', 'IMPERFECTO', 'FUTURO', 'CONDICIONAL', 'FUTURO_PERFECTO', 'PLUSCUAMPERFECTO', 'PRESENTE_PERFECTO', 'PRETERITO_ANTERIOR', 'CONDICIONAL_PERFECTO');

-- CreateEnum
CREATE TYPE "PerformerEnum" AS ENUM ('NON_FINITE', 'YO', 'TU', 'EL_ELLA_USTED', 'NOSOTROS_NOSOTRAS', 'VOSOTROS_VOSOTRAS', 'ELLOS_ELLAS_USTEDES');

-- CreateEnum
CREATE TYPE "EndingEnum" AS ENUM ('ER', 'AR', 'IR');

-- CreateEnum
CREATE TYPE "WordTypeEnum" AS ENUM ('ART', 'ADJ', 'ADV', 'CONJ', 'F', 'PLUS_FAM', 'MINUS_FAM', 'INTERJ', 'M', 'N', 'NC', 'NF', 'NF_EL', 'NM', 'NMF', 'NM_F', 'NUM', 'OBJ', 'DIR_OBJ', 'INDIR_OBJ', 'PL', 'PREP', 'PRON', 'SG', 'SUBI', 'V', 'SPEAKERS');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Curriculum" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "order" JSONB NOT NULL,

    CONSTRAINT "Curriculum_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" "GameTypeEnum" NOT NULL,
    "curriculumId" TEXT NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameUnitRelation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextPlay" TIMESTAMP(3) NOT NULL,
    "lastPlay" TIMESTAMP(3) NOT NULL,
    "state" JSONB NOT NULL,
    "history" JSONB NOT NULL,
    "gameId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,

    CONSTRAINT "GameUnitRelation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Unit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "corpusId" TEXT NOT NULL,
    "corpusType" "CorpusTypeEnum" NOT NULL,
    "status" "UnitStatusEnum" NOT NULL,

    CONSTRAINT "Unit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "index" INTEGER NOT NULL,
    "spanish" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "type" "WordTypeEnum" NOT NULL,
    "usageInSpanish" TEXT,
    "usageInEnglish" TEXT,
    "data" JSONB,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conjugation" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" TEXT NOT NULL,
    "tense" "TenseEnum" NOT NULL,
    "performer" "PerformerEnum" NOT NULL,
    "ending" "EndingEnum" NOT NULL,
    "mood" "MoodEnum" NOT NULL,
    "verbId" TEXT NOT NULL,

    CONSTRAINT "Conjugation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerbStem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" TEXT NOT NULL,
    "tense" "TenseEnum" NOT NULL,
    "mood" "MoodEnum" NOT NULL,
    "conjugationId" TEXT,

    CONSTRAINT "VerbStem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerbEnding" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "value" TEXT NOT NULL,
    "ending" "EndingEnum" NOT NULL,
    "tense" "TenseEnum" NOT NULL,
    "performer" "PerformerEnum" NOT NULL,
    "mood" "MoodEnum" NOT NULL,
    "conjugationId" TEXT,

    CONSTRAINT "VerbEnding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CurriculumToUnit" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "GameUnitRelation_unitId_gameId_key" ON "GameUnitRelation"("unitId", "gameId");

-- CreateIndex
CREATE UNIQUE INDEX "Unit_corpusId_corpusType_key" ON "Unit"("corpusId", "corpusType");

-- CreateIndex
CREATE UNIQUE INDEX "Word_index_key" ON "Word"("index");

-- CreateIndex
CREATE UNIQUE INDEX "Conjugation_verbId_tense_performer_mood_key" ON "Conjugation"("verbId", "tense", "performer", "mood");

-- CreateIndex
CREATE UNIQUE INDEX "VerbStem_conjugationId_key" ON "VerbStem"("conjugationId");

-- CreateIndex
CREATE UNIQUE INDEX "VerbEnding_conjugationId_key" ON "VerbEnding"("conjugationId");

-- CreateIndex
CREATE UNIQUE INDEX "_CurriculumToUnit_AB_unique" ON "_CurriculumToUnit"("A", "B");

-- CreateIndex
CREATE INDEX "_CurriculumToUnit_B_index" ON "_CurriculumToUnit"("B");

-- AddForeignKey
ALTER TABLE "Game" ADD CONSTRAINT "Game_curriculumId_fkey" FOREIGN KEY ("curriculumId") REFERENCES "Curriculum"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameUnitRelation" ADD CONSTRAINT "GameUnitRelation_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameUnitRelation" ADD CONSTRAINT "GameUnitRelation_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conjugation" ADD CONSTRAINT "Conjugation_verbId_fkey" FOREIGN KEY ("verbId") REFERENCES "Word"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerbStem" ADD CONSTRAINT "VerbStem_conjugationId_fkey" FOREIGN KEY ("conjugationId") REFERENCES "Conjugation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerbEnding" ADD CONSTRAINT "VerbEnding_conjugationId_fkey" FOREIGN KEY ("conjugationId") REFERENCES "Conjugation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CurriculumToUnit" ADD CONSTRAINT "_CurriculumToUnit_A_fkey" FOREIGN KEY ("A") REFERENCES "Curriculum"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CurriculumToUnit" ADD CONSTRAINT "_CurriculumToUnit_B_fkey" FOREIGN KEY ("B") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
