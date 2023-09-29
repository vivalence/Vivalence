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
CREATE TABLE "Word" (
    "id" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "spanish" TEXT NOT NULL,
    "english" TEXT NOT NULL,
    "type" "WordTypeEnum" NOT NULL,

    CONSTRAINT "Word_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conjugation" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "tense" "TenseEnum" NOT NULL,
    "performer" "PerformerEnum" NOT NULL,
    "ending" "EndingEnum" NOT NULL,
    "verbId" TEXT,

    CONSTRAINT "Conjugation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerbStem" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "tense" "TenseEnum" NOT NULL,
    "conjugationId" TEXT NOT NULL,

    CONSTRAINT "VerbStem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerbEnding" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "ending" "EndingEnum" NOT NULL,
    "tense" "TenseEnum" NOT NULL,
    "performer" "PerformerEnum" NOT NULL,
    "conjugationId" TEXT NOT NULL,

    CONSTRAINT "VerbEnding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Word_index_key" ON "Word"("index");

-- CreateIndex
CREATE UNIQUE INDEX "VerbStem_conjugationId_key" ON "VerbStem"("conjugationId");

-- CreateIndex
CREATE UNIQUE INDEX "VerbEnding_conjugationId_key" ON "VerbEnding"("conjugationId");

-- AddForeignKey
ALTER TABLE "Conjugation" ADD CONSTRAINT "Conjugation_verbId_fkey" FOREIGN KEY ("verbId") REFERENCES "Word"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerbStem" ADD CONSTRAINT "VerbStem_conjugationId_fkey" FOREIGN KEY ("conjugationId") REFERENCES "Conjugation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerbEnding" ADD CONSTRAINT "VerbEnding_conjugationId_fkey" FOREIGN KEY ("conjugationId") REFERENCES "Conjugation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
