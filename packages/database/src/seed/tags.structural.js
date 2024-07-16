import { sleep } from "./lib.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TAKE = 1000000;
const START = 0;

const BATCHSIZE = 100;
const BATCHINTERVAL = 1000;

let index = 0;
const counter = {};

async function main() {
  const units = await prisma.unit.findMany({
    take: TAKE,
    skip: START,
  });
  const promises = [];

  for (const unit of units) {
    const { ud } = unit.data;
    if (!ud) continue;
    const { feats } = ud;
    if (!feats) continue;
    // console.log("feats", feats);
    // feats {
    //   Gender: "Masculine",
    //   Number: "Singular",
    //   Definite: "Indefinite",
    //   PronType: "Article"
    // }

    for (const feat in feats) {
      const name = `${feat}_${feats[feat]}`;
      index++;
      if (!counter[feat]) {
        await prisma.tag.upsert({
          where: { name: feat },
          update: {},
          create: { name: feat },
        });
      }
      counter[feat] = counter[feat] ? counter[feat] + 1 : 1;
      counter[name] = counter[name] ? counter[name] + 1 : 1;

      // console.log("feat", name);

      promises.push(
        (async (name) => {
          try {
            await prisma.tag.upsert({
              where: { name },
              update: {
                units: { connect: { id: unit.id } },
                tags: { connect: { name: feat } },
              },
              create: {
                name,
                tags: { connect: { name: feat } },
                units: { connect: { id: unit.id } },
              },
            });
          } catch (error) {
            if (error.code === "P2002") {
            } else {
              console.log("ERROR", error);
              throw error;
            }
          }
        })(name),
      );

      if (index % BATCHSIZE === 0) {
        console.log(
          `batch launched ${index / BATCHSIZE} / ${units.length / BATCHSIZE}`,
          counter,
        );
        // await sleep(BATCHINTERVAL);
        await Promise.all(promises);
      }
    }
  }

  await Promise.all(promises);
}

await main();
