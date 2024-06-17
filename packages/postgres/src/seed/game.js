import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({});

async function mainOne() {
    const data = {
        type: "FLASHCARDS",

        curriculumRelation: {
            create: {
                curriculum: { connect: { id: "clpl75uu00000g0mwkivlcucv" } },
                mask: { create: { data: {} } },
            },
        },
    };

    const update = await prisma.game.create({ data });
}

async function main() {
    let index = 0;
    const reviews = await sourcePrisma.$queryRaw`SELECT * FROM public."Review";`;

    for (const review of reviews) {
        const data = {
            id: review.id,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
            unit: {
                connect: { corpusId_corpusType: { corpusId: review.itemId, corpusType: "WORD" } },
            },
            game: { connect: { id: "clnt1upox0000g0iddrya4pr4" } },
            nextPlay: review.nextReview,
            lastPlay: review.lastReview,
            state: review.model,
            history: [],
        };

        const update = await targetPrisma.gameUnitRelation.create({ data });
        if (index++ % 100 === 0) console.log("update", update);
    }
}

await mainOne();
