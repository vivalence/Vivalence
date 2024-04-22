import { json } from "@sveltejs/kit";
import supabase from "$lib/server/supabase.js";

export const handle = async ({ event, resolve }) => {
    event.locals.supabase = supabase(event);

    event.locals.params = () => {
        return JSON.parse(event.url.searchParams.get("body"));
    };
    event.locals.get = async (url, body) => {
        const options = { method: "GET" };
        const urlParams = new URLSearchParams({ body: JSON.stringify(body) }).toString();
        const response = await event.fetch(`${url}?${urlParams}`, options);
        return response.json();
    };
    event.locals.post = async (url, body) => {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        };
        const response = await event.fetch(url, options);
        return response.json();
    };

    event.locals.getSession = async () => {
        const { data } = await event.locals.supabase.auth.getSession();
        // console.log(data);
        return data.session;
    };

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === "content-range";
        }
    });
};

// const units = [
//     {id: "clpl45jv5003eg0s372o6hty1", data: {ud: {text: "están", upos: "VERB", xpos: "vmip3p0", feats: {Mood: "Indicative", Tense: "Present", Number: "Plural", Person: "Third", VerbForm: "Finite"}, lemma: "estar", udFeats: "Mood=Ind|Number=Plur|Person=3|Tense=Pres|VerbForm=Fin"}, mood: "INDICATIVO", tense: "PRESENTE", ending: "AR", english: "they are", spanish: "están", performer: "ELLOS_ELLAS_USTEDES", corpusVerbId: "cln4xlsqw000kg01v2rt04kqz", lemmaSpanish: "estar", usageInEnglish: "They are playing.", usageInSpanish: "Ellos están jugando."}, corpusId: "clpign215000fg0q17usrj67f", createdAt: "2023-11-30T10:29:31.601", updatedAt: "2024-01-07T10:08:12.963", corpusType: "CONJUGATION", objectStatus: "ACTIVE", tags: [{id: "clrzb14tl002dg0m3p5lsy4f3", data: { LEARNABLE: {}, ONTOLOGICAL: { leaf: "Plur", branch: "Number" } }, name: "Number Plural", type: ["LEARNABLE", "ONTOLOGICAL"], createdAt: "2024-01-29T18:10:12.488", updatedAt: "2024-01-29T18:10:12.488"}, {id: "clpwfwpoo000rg0n12jtcg952", data: { LEARNABLE: {}, ONTOLOGICAL: { leaf: "3", branch: "Person" } }, name: "Third Person", type: ["ONTOLOGICAL", "LEARNABLE"], createdAt: "2023-12-08T08:44:02.568", updatedAt: "2023-12-08T08:44:02.568"}], memory: {id: "ed77b856-6e15-40d9-b377-8406aff2352f", state: [7.030127083485992, 7.030127083507377, 73.77448588861199], tagId: null, status: "LEARNING", unitId: "clpl45jv5003eg0s372o6hty1", lastSeen: "2024-04-22T10:02:48.68", strength: -0.02682572096115532}},
//     {id: "clpl45jq1003bg0s3kaq3aad4", data: {ud: {text: "está", upos: "VERB", xpos: "vmip3s0", feats: {Mood: "Indicative", Tense: "Present", Number: "Singular", Person: "Third", VerbForm: "Finite"}, lemma: "estar", udFeats: "Mood=Ind|Number=Sing|Person=3|Tense=Pres|VerbForm=Fin"}, mood: "INDICATIVO", tense: "PRESENTE", ending: "AR", english: "he/she/it is", spanish: "está", performer: "EL_ELLA_USTED", corpusVerbId: "cln4xlsqw000kg01v2rt04kqz", lemmaSpanish: "estar", usageInEnglish: "He is happy.", usageInSpanish: "Él está feliz."}, corpusId: "clpign1tq0009g0q192epgbcs", createdAt: "2023-11-30T10:29:31.417", updatedAt: "2024-01-07T10:08:12.964", corpusType: "CONJUGATION", objectStatus: "ACTIVE", tags: [{id: "clpwfwpoo000rg0n12jtcg952", data: { LEARNABLE: {}, ONTOLOGICAL: { leaf: "3", branch: "Person" } }, name: "Third Person", type: ["ONTOLOGICAL", "LEARNABLE"], createdAt: "2023-12-08T08:44:02.568", updatedAt: "2023-12-08T08:44:02.568"}, {id: "clrzaz4ir0006g0jsp53an5jh", data: { LEARNABLE: {}, ONTOLOGICAL: { leaf: "Sing", branch: "Number" } }, name: "Number Singular", type: ["LEARNABLE", "ONTOLOGICAL"], createdAt: "2024-01-29T18:08:40.228", updatedAt: "2024-01-29T18:08:40.228"}], memory: {id: "3e540908-3c09-477b-8650-51d037767618", state: [4.481779907722391, 4.481779907833813, 32.114527214673146], tagId: null, status: "LEARNING", unitId: "clpl45jq1003bg0s3kaq3aad4", lastSeen: "2024-04-22T10:02:48.544", strength: -0.06314709730554657}},
//     {id: "clpl45jmn0039g0s3b71whevt", data: {ud: {text: "estoy", upos: "VERB", xpos: "vmip1s0", feats: {Mood: "Indicative", Tense: "Present", Number: "Singular", Person: "First", VerbForm: "Finite"}, lemma: "estar", udFeats: "Mood=Ind|Number=Sing|Person=1|Tense=Pres|VerbForm=Fin"}, mood: "INDICATIVO", tense: "PRESENTE", ending: "AR", english: "I am", spanish: "estoy", performer: "YO", corpusVerbId: "cln4xlsqw000kg01v2rt04kqz", lemmaSpanish: "estar", usageInEnglish: "I am tired.", usageInSpanish: "Yo estoy cansado."}, corpusId: "clpign1or0005g0q1x5nuwua9", createdAt: "2023-11-30T10:29:31.295", updatedAt: "2024-01-07T10:08:12.963", corpusType: "CONJUGATION", objectStatus: "ACTIVE", tags: [{id: "clrzaz4ir0006g0jsp53an5jh", data: { LEARNABLE: {}, ONTOLOGICAL: { leaf: "Sing", branch: "Number" } }, name: "Number Singular", type: ["LEARNABLE", "ONTOLOGICAL"], createdAt: "2024-01-29T18:08:40.228", updatedAt: "2024-01-29T18:08:40.228"}, {id: "clpwfwplo000pg0n1sc4frv60", data: { LEARNABLE: {}, ONTOLOGICAL: { leaf: "1", branch: "Person" } }, name: "First Person", type: ["ONTOLOGICAL", "LEARNABLE"], createdAt: "2023-12-08T08:44:02.461", updatedAt: "2023-12-08T08:44:02.461"}], memory: {id: "17d161f7-8e65-4d0e-b618-caa8223a763d", state: [5.321397369046794, 5.321397369020456, 1352.4936471841054], tagId: null, status: "GRADUATED", unitId: "clpl45jmn0039g0s3b71whevt", lastSeen: "2024-04-22T10:02:48.556", strength: -0.0014907973960207599}}
// ];

// const sortUnits = (units) => {
//     const getSortValue = (tag) => {
//         const { leaf, branch } = tag.data.ONTOLOGICAL;
//         if (branch === "Person") return parseInt(leaf);
//         return leaf === "Sing" ? 0 : 10;
//     };
//     return units.sort((a, b) => {
//         const aSortValues = a.tags.map(getSortValue),
//             bSortValues = b.tags.map(getSortValue);
//         for (let i = 0; i < Math.min(aSortValues.length, bSortValues.length); i++) {
//             if (aSortValues[i] !== bSortValues[i]) return aSortValues[i] - bSortValues[i];
//         }
//         return aSortValues.length - bSortValues.length;
//     });
// };

// const sortedUnits = sortUnits(units).map((unit, index) => {
//     unit.index = index;
//     return unit;
// });

// sortedUnits.map((unit) => {
//     console.log(unit.index, unit.data.spanish);
// });
