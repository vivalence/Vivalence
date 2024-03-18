import { builder } from "../../pothos-client/builder.js";

builder.inputType("Game_Translations_SentenceTranslation_Input", {
    fields: (t) => ({
        gameId: t.id({ required: true }),
        learning: t.string({ required: true }),
        spoken: t.string({ required: true }),
        translation: t.string({ required: true }),
        payload: t.string({ required: true }),
    }),
});
