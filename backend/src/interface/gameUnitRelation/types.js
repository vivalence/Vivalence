import { builder } from "../../pothos-client/builder.js";

builder.objectType("GameUnitRelation", {
    fields: (t) => ({
        id: t.field({ type: "ID", resolve: ({ id }) => id }),
        nextPlay: t.field({ type: "DateTime", resolve: ({ nextPlay }) => nextPlay }),
    }),
});
