import { builder } from "../../pothos-client/builder.js";

const CurriculumType = builder.prismaObject("Curriculum", {
    description: "A curriculum is a collection of Units and Games.",
    fields: (t) => {
        return {
            id: t.exposeID("id"),
            name: t.exposeString("name"),
            gameRelations: t.relation("gameRelations"),
        };
    },
});

const CurriculumGameRelationType = builder.prismaObject("CurriculumGameRelation", {
    description: "The relation between a curriculum and a game",
    fields: (t) => {
        return {
            id: t.exposeID("id"),
            game: t.relation("game"),
            curriculum: t.relation("curriculum"),
        };
    },
});
