import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const data = {
    conjugations: await prisma.conjugation.findMany({}),
    reviews: await prisma.review.findMany({}),
    words: await prisma.word.findMany({})
};

console.log("lenghts", data.conjugations.length, data.reviews.length, data.words.length);

// orderBy: { index: "asc" },
// take: 1
// include: {conjugations: true}

fs.writeFileSync("./prisma-server/seed/data/backup.json", JSON.stringify(data, null, 2));
