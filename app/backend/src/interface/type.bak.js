// const WordObject = builder.prismaObject("Word", {
//     fields: (t) => ({
//         id: t.exposeID("id"),
//         index: t.exposeInt("index"),
//         spanish: t.exposeString("spanish"),
//         english: t.exposeString("english"),
//         type: t.field({
//             type: "WordTypeEnum",
//             resolve: (root) => root.type
//         }),
//         review: t.relation("review")
//     })
// });

// const WordTypeEnum = builder.enumType("WordTypeEnum", {
//     values: [
//         "ART",
//         "ADJ",
//         "ADV",
//         "CONJ",
//         "F",
//         "PLUS_FAM",
//         "MINUS_FAM",
//         "INTERJ",
//         "M",
//         "N",
//         "NC",
//         "NF",
//         "NF_EL",
//         "NM",
//         "NMF",
//         "NM_F",
//         "NUM",
//         "OBJ",
//         "DIR_OBJ",
//         "INDIR_OBJ",
//         "PL",
//         "PREP",
//         "PRON",
//         "SG",
//         "SUBI",
//         "V",
//         "SPEAKERS"
//     ]
// });

// const StatusEnum = builder.enumType("StatusEnum", {
//     values: ["HIDDEN", "ACTIVE"]
// });

// export const ReviewItemTypeEnumMap = {
//     word: "WORD",
//     conjugatedVerb: "CONJUGATED_VERB",
//     verbStem: "VERB_STEM",
//     verbEnding: "VERB_ENDING"
// };

// const ReviewItemTypeEnum = builder.enumType("ReviewItemTypeEnum", {
//     values: Object.values(ReviewItemTypeEnumMap)
// });

// export const ReviewResponseTypeEnumMap = {
//     known: "KNOWN",
//     unknown: "UNKNOWN",
//     graduate: "GRADUATE"
// };

// const ReviewResponseTypeEnum = builder.enumType("ReviewResponseTypeEnum", {
//     values: Object.values(ReviewResponseTypeEnumMap)
// });
