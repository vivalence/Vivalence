// import { prisma } from "../../prisma-client.js";
// // import { getNewUnits } from "./gameUnits.js";

// // get flashcards units {
// //   blacklist: [],
// //   fetch: 5,
// //   gameId: "clq0z4qxu0000g0f8fwz5ivhc"
// // }
// // game clq0z4qxu0000g0f8fwz5ivhc
// // getter getPrioritizedUnits
// // newUnits 0
// // getter getDueUnits
// // newUnits 0
// // getter getNewUnits
// export const getNewUnits = async (inputs) => {
//     // const { curriculumId, gameId, tags = [], status = STATUS, blacklist = [], take = 1 } = inputs;

//     // const where = {
//     //     curriculumId,
//     //     unit: {
//     //         status: { notIn: ["HIDDEN"] },
//     //         gameRelations: { none: { gameId } },
//     //     },
//     // };

//     // if (blacklist.length > 0) where.unit["id"] = { notIn: blacklist };
//     // if (tags.length > 0) where.unit["AND"] = tags.map((tag) => ({ tags: { some: { name: tag } } }));
//     const query = {
//         where: {
//             curriculumId: "clpl75uu00000g0mwkivlcucv",
//             unit: {
//                 OR: [{ status: { notIn: ["HIDDEN"] } }, { status: null }],
//                 // status: { not: "HIDDEN" },
//                 gameRelations: {
//                     none: {
//                         gameId: "clq0z4qxu0000g0f8fwz5ivhc",
//                     },
//                 },
//             },
//         },
//         orderBy: {
//             index: "asc",
//         },
//         select: {
//             unit: true,
//             // unit: {
//             //         include: {
//             //             tags: {
//             //                 select: {
//             //                     name: true,
//             //                 },
//             //             },
//             //         },
//             // },
//         },
//         take: 5,
//     };

//     // console.log("queryInput", {where, orderBy: { index: "asc" }, select: {unit: {include: {tags: { select: { name: true } },},},}, take,});
//     const relations = await prisma.curriculumUnitRelation.findMany(query);

//     // {where, orderBy: { index: "asc" }, select: {unit: {include: {tags: { select: { name: true } },},},}, take,}
//     console.log("relations.length", relations.length);
//     console.log(
//         "relations.length",
//         relations.map(({ status }) => status),
//     );
//     return relations.map(({ unit }) => unit);
// };

// // await getNewUnits();
