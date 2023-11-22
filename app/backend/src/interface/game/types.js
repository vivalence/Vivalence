import { builder } from "../../pothos-client/builder.js";

const GameType = builder.prismaObject("Game", {
    description: "A Game",
    fields: (t) => {
        return {
            id: t.exposeID("id"),
            type: t.field({
                type: "GameTypeEnum",
                resolve: (root) => root.type,
            }),
            typePretty: t.field({
                type: "String",
                resolve: (root) => GameTypeEnumMap[root.type],
            }),
            curriculumRelation: t.relation("curriculumRelation"),
        };
    },
});

export const GameTypeEnumMap = {
    FLASHCARDS: "Flashcards",
};

const GameTypeEnum = builder.enumType("GameTypeEnum", {
    values: Object.keys(GameTypeEnumMap),
});
