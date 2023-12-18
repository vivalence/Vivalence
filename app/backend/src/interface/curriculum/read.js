import { builder } from "../../pothos-client/builder.js";

const curriculumsRead = builder.queryField("curriculumsRead", (t) => {
    return t.field({
        type: ["Curriculum"],
        resolve: async (root, args, { prisma }) => {
            const data = await prisma.curriculum.findMany({
                include: {
                    gameRelations: { include: { game: true } },
                },
                orderBy: { name: "desc" },
            });

            return data;
        },
    });
});
