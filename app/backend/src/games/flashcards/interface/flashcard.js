import Mustache from "mustache";

import { builder } from "../../../pothos-client/builder.js";

// import { getNextGameUnit } from "../logic/getNextGameUnit.js";

// Shared Types
builder.objectType("FlashcardsGameCard", {
    fields: (t) => ({
        unitId: t.field({ type: "ID", resolve: ({ unit }) => unit.id }),
        front: t.string({
            resolve: ({ mask, unit }, _, ctx) => {
                return Mustache.render(mask.data.front, unit.data);
            },
        }),
        back: t.string({
            resolve: ({ mask, unit }, args, ctx) => {
                return Mustache.render(mask.data.back, unit.data);
            },
        }),
    }),
});

// Enums
builder.enumType("FlashcardsGameReviewResponses", {
    values: ["KNOWN", "UNKNOWN", "GRADUATE"],
});
