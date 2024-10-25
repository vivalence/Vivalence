import { PrismaClient } from "@prisma/client";

const targetPrisma = new PrismaClient({
  datasources: {
    db: {
      url: "postgresql://valence:DUMMY@localhost:5432/valence-spanish-vII",
    },
  },
});

async function main() {
  const units = await targetPrisma.unit.findMany({});

  const data = {
    name: "Vocabulario 5000",
    unitRelations: {
      create: units.map((unit) => ({
        unit: { connect: { id: unit.id } },
        index: unit.data.index,
      })),
    },
  };

  const update = await targetPrisma.curriculum.create({ data });
}

await main();
