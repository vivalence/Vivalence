import { PrismaClient } from "@prisma/client";

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

async function mainOne() {
    const data = {
        type: "FLASHCARDS",
        curriculum: { connect: { id: "clnt1os200000g04mn5i16991" } }
    };

    const update = await targetPrisma.game.create({ data });
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
                connect: { corpusId_corpusType: { corpusId: review.itemId, corpusType: "WORD" } }
            },
            game: { connect: { id: "clnt1upox0000g0iddrya4pr4" } },
            nextPlay: review.nextReview,
            lastPlay: review.lastReview,
            state: review.model,
            history: []
        };

        const update = await targetPrisma.gameUnitRelation.create({ data });
        if (index++ % 100 === 0) console.log("update", update);
    }
}

await main();
