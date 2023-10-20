import { PrismaClient } from "@prisma/client";

const targetPrisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://valence:DUMMY@localhost:5432/valence-spanish-vII"
        }
    }
});
const front = `<p class="text-3xl font-bold">{{english}}</p>
        <p class="text-xl">{{usedInEnglish}}</p>`;
const back = `<p class="text-3xl font-bold">{{spanish}}</p>
        <p class="text-xl">{{usedInSpanish}}</p>`;
async function mainOne() {
    const data = {
        data: { front, back }
    };

    const update = await targetPrisma.mask.updateMany({ data });
}

await mainOne();
