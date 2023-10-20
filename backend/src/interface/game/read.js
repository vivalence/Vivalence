import { builder } from "../../pothos-client/builder.js";

builder.queryFields((t) => ({
    gameRead: t.field({
        type: "Game",
        args: {
            id: t.arg({ type: "ID", required: true })
        },
        resolve: async (root, args, { prisma }) => {
            const data = await prisma.game.findUnique({
                where: { id: args.id }
            });
            return data;
        }
    })
}));
