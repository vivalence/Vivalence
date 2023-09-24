import "./words.js";
// import "./conjugation.js";

// model Word {
//   // Meta
//   id String @id @default(cuid())

//   // It
//   index   Int          @unique
//   spanish String
//   english String
//   type    WordTypeEnum

//   // Down
//   conjugations Conjugation[]
// }

// model Conjugation {
//   // Meta
//   id String @id @default(cuid())

//   // It
//   value     String
//   tense     TenseEnum
//   performer PerformerEnum
//   ending    EndingEnum
//   mood      MoodEnum
//   // Up
//   verb   Word   @relation(fields: [verbId], references: [id])
//   verbId String
//   // Down
//   verbStem   VerbStem?
//   verbEnding VerbEnding?
// }

// import fs from "fs";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// const words = await prisma.word.findMany({
//   orderBy: { index: "asc" },
//   where: { type: "V" },
//   // take: 900,
//   include: {
//     conjugations: true,
//   },
// });
// // fs.writeFileSync("./tmp.json", JSON.stringify(words, null, 2));
// for (const word of words) {
//   // console.log("word", word.conjugations.length);
//   if (word.conjugations.length === 0) {
//     console.log(word.spanish, ",");
//   }
// }
