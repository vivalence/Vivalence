import { writeToFile } from "./lib.js";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({});

let index = 0;
async function main() {
  // const user = await prisma.user.create({ data: {} });
  const units = await prisma.$queryRaw`SELECT * FROM public."Unit";`;
  console.log("units", units.length);

  for (const unit of units) {
    const data = {
      createdAt: unit.createdAt,
      updatedAt: unit.updatedAt,
      userId: "clph9fwsl0000g0qt5l1wgvg1", // user.id,
      unitId: unit.id,
      state: {},
      status: unit.status,
    };

    // console.log("data", data);
    const update = await prisma.unitUserRelation.create({ data });
    if (index++ % 100 === 0) console.log(`${index}: `, update);
  }
}

await main();
