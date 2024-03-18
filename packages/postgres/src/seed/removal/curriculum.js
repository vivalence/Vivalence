import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
// something is wrong here.

// curriculumGameRelation
// if the game has only a relatoin with this curriculum
// then game too
// if the mask has only a relation with this curriculumgamerelation
// then mask too
// curriculum Unit Relatoin
// i could also do that differently. delte the main object and then clean up orphaned objects

// when i delete a curriculum, i must also delete the game. and all relevant relatoins.

// KillList:
// x curriculum
// x game
// x gameUnitRelation
// curriculumGameRelation
// curriculumUnitRelation

// // and all masks that have 0 curriculumRelations
// const curriculum = await prisma.curriculum.findUnique({
//     where: {
//         id: "clpl75uu00000g0mwkivlcucv",
//     },
//     include: {
//         unitRelations: true,
//         gameRelations: true,
//     },
// });
// // console.log("curriculum", curriculum);

// // Delete CurriculumGameRelations
// const deletedCGR = await prisma.curriculumGameRelation.deleteMany({
//     where: { curriculumId: curriculum.id },
// });
// console.log("deletedCGR", deletedCGR);

// // Delete GameUnitRelations
// const deletedGUR = await prisma.gameUnitRelation.deleteMany({
//     where: {
//         gameId: {
//             in: , curriculum.gameRelations.map((cgr) => cgr.gameId),
//         },
//     },
// });
// console.log("deletedGUR", deletedGUR);

// // Delete Games
// const deletedG = await prisma.game.deleteMany({
//     where: {
//         id: {
//             in:  curriculum.gameRelations.map((cgr) => cgr.gameId)
//         },
//     },
// });
// console.log("deletedG", deletedG);

// // Delete CurriculumUnitRelations
// const deletedCUR = await prisma.curriculumUnitRelation.deleteMany({
//     where: { curriculumId: curriculum.id },
// });
// console.log("deletedCUR", deletedCUR);

// // Delete Curriculum
// const deletedC = await prisma.curriculum.delete({ where: { id: curriculum.id } });
// console.log("deletedC", deletedC);

// // // delete all masks that have no curriculumRelations at all
// const deletedM = await prisma.mask.findMany({
//     // where: {
//     //     CurriculumGameRelation: { none: {} },
//     // },
//     include: { CurriculumGameRelation: true },
// });
// console.log("deletedM", deletedM.length);
