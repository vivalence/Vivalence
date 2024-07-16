import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const mask = {
  WORD: {
    buildData: (({ data }) => ({
      spanish: data.spanish,
      english: data.english,
      usedInEnglish: data.usedInEnglish,
      usedInSpanish: data.usedInSpanish,
    })).toString(),
    back: `
<p class="text-3xl font-sans-heading font-light mb-3">
    {{spanish}}
</p>
<p class="text-lg">
    {{usedInSpanish}}
</p>`,
    front: `
<p class="text-3xl font-sans-heading font-light mb-3">
    {{english}}
</p>
<p class="text-lg">
    {{usedInEnglish}}
</p>`,
  },

  CONJUGATION: {
    buildData: (({ data }) => ({
      spanish: data.spanish,
      english: data.english,
      person: data.ud.feats.Person,
      number: data.ud.feats.Number,
    })).toString(),
    back: `
<p class="text-3xl font-sans-heading font-light">
    {{spanish}}
</p>`,
    front: `
<p class="text-3xl font-sans-heading font-light mb-3">
    {{english}}
</p>
<p class="text-lg">
    <span class="">{{person}} person {{number}}</span>
</p>`,
  },
};

async function update() {
  const where = { id: "asdf123on00tpg01pnxhkh8tp" };

  const data = { data: mask };
  const update = await prisma.mask.update({ where, data });
}

await update();
