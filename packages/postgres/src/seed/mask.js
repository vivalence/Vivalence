import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({});

async function mainOne() {
    const where = {
        id: "clq0z4qxv0002g0f8f93uwkc4",
    };
    const data = {
        data: {
            WORD: {
                back: `<p class="text-3xl font-sans-heading font-light mb-3">{{spanish}}</p>
 <p class="text-lg">{{usedInSpanish}}</p>`,
                front: `<p class="text-3xl font-sans-heading font-light mb-3">{{english}}</p>
  <p class="text-lg">{{usedInEnglish}}</p>`,
            },
            CONJUGATION: {
                front: `<p class="text-3xl font-sans-heading font-light mb-3">{{english}}</p>
<p class="text-lg">
    <span class="">Mood:</span> {{mood}}<br>
    <span class="">Tense:</span> {{tense}}<br>
    <span class="">Performer:</span> {{performer}}
</p>`,
                back: `<p class="text-3xl font-sans-heading font-light">Ser</p>`,
            },
        },
    };

    const update = await prisma.mask.update({ where, data });
}

await mainOne();
