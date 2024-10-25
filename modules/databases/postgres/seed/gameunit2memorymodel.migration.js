import { sleep } from "./lib.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TAKE = 10000;
const START = 001;
const BATCHSIZE = 50;

let index = START;

async function getGameUnitRelations(TAKE, START) {
  const relations = await prisma.gameUnitRelation.findMany({
    include: { unit: true },
    orderBy: { lastPlay: "desc" },
    take: TAKE,
    skip: START,
  });
  return relations;
}

async function createModel(relation, index) {
  try {
    const { unitId, gameId, state, history, unit } = relation;

    const update = await prisma.memoryModel.create({
      data: {
        createdAt: relation.createdAt,
        updatedAt: relation.updatedAt,
        history: history || [],
        type: "EBISU_v2",
        status: unit.status,
        state: state,
        unit: { connect: { id: unit.id } },
      },
    });
    // console.log("update", update);
    return update;
  } catch (error) {
    if (error.code === "P2002") {
      console.log("Unique constraint violated, record not created", index, relation.id);
    } else {
      console.error("An unexpected error occurred:", error, index, relation);
      throw error;
    }
  }
}

async function updateModel(relation, index) {
  try {
    const { unitId, lastPlay } = relation;
    // console.log({ unitId, lastPlay });

    const update = await prisma.memoryModel.update({
      where: { unitId },
      data: {
        lastSeen: lastPlay,
      },
    });
    // console.log("update", update);
    return update;
  } catch (error) {
    if (error.code === "P2002") {
      console.log("Unique constraint violated, record not created", index, relation.id);
    } else {
      console.error("An unexpected error occurred:", error, index, relation);
      throw error;
    }
  }
}
async function main() {
  const relations = await getGameUnitRelations(TAKE, START);
  console.log("relations count", relations.length);

  try {
    const promises = [];

    while (relations.length > 0) {
      const batch = relations.splice(0, BATCHSIZE);

      for (const relation of batch) {
        index++;
        // const update = createModel(relation, index);
        const update = updateModel(relation, index);
        promises.push(update);
      }

      console.log(`${index}:${relations.length}`);

      await sleep(3000);
    }

    const counts = await Promise.all(promises);
    console.log("counts", counts.filter((c) => !!c).length);
  } catch (e) {
    if (e.code !== "P2002") console.error("[error]", index, e);
  }
  // console.log("notFound", notFound.length);
}

await main();
