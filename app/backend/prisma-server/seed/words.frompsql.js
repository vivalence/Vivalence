import { PrismaClient } from "@prisma/client";
import { writeToFile } from "./lib.js";

const sourcePrisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://valence:a87%24%26Fhasds9@db.valence.education:5432/valence-spanish?sslmode=disable"
        }
    }
});

const targetPrisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://valence:DUMMY@localhost:5432/valence-spanish-vII"
        }
    }
});

async function main() {
    const words = await sourcePrisma.word.findMany({
        // take: 1
    });

    // const filePath = "./prisma-server/seed/data/words.vII.json";
    // await writeToFile(words, filePath);
    for (const word of words) {
        try {
            const data = {
                ...word
            };

            const update = await targetPrisma.word.create({ data });
            // const update = await prisma.word.updateMany({where: { index: data.index }, data});
            // console.log("update", update.index);
            if (update.index % 100 === 0) console.log("update", update);
        } catch (e) {
            console.error("[error]", e);
            console.error("[update]", word);
        }
    }
}

await main();

// const words = await targetPrisma.word.findMany({
//     take: 25,
// });
