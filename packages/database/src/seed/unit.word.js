import { writeToFile } from "./lib.js";
import { PrismaClient } from "@prisma/client";

const sourcePrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://valence:a87%24%26Fhasds9@db.valence.education:5432/valence-spanish?sslmode=disable",
    },
  },
});

const targetPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://valence:DUMMY@localhost:5432/valence-spanish-vII",
    },
  },
});

async function main() {
  const words = await sourcePrisma.$queryRaw`SELECT * FROM public."Word";`;

  for (const word of words) {
    try {
      const data = {
        // corpusId: word.id,
        // unitType: "WORD",
        // status: mapStatus(word.status),
        data: {
          index: word.index,
          type: word.type,
          english: word.english,
          spanish: word.spanish,
          usedInSpanish: word.usageInSpanish,
          usedInEnglish: word.usageInEnglish,
        },
      };
      // console.log("data", data);
      // console.log("word", word);
      // return;

      const update = await targetPrisma.unit.update({
        where: { corpusId_unitType: { corpusId: word.id, unitType: "WORD" } },
        data,
      });
      if (word.index % 100 === 0) console.log("update", update);
    } catch (e) {
      console.error("[error]", e);
      console.error("[update]", word);
    }
  }
}
const mapStatus = (status) => {
  switch (status) {
    case "ACTIVE":
      return "LEARNING";
    case "HIDDEN":
      return "HIDDEN";
    case "KNOWN":
      return "KNOWN";
    case "PRIORITIZED":
      return "PRIORITIZED";
    default:
      return "UNKNOWN";
  }
};

await main();
