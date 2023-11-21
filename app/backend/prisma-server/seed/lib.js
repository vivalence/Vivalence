import { promises as fs } from "fs";
export const writeToFile = async (data, filePath) => {
    if (await fs.exists(filePath)) throw new Error("File already exists");
    try {
        const datajson = JSON.stringify(data, null, 2);
        await fs.writeFile(filePath, datajson, "utf8");
        console.log("Data written successfully");
    } catch (err) {
        console.error("Error:", err);
    }
};
export const appendToFile = async (list, filePath) => {
    try {
        // Read the existing file
        const data = await fs.readFile(filePath, "utf8");

        // Parse the existing JSON data
        const existingData = JSON.parse(data);

        // Append the new data
        const updatedData = existingData.concat(list);

        // Stringify the updated data with formatting
        const updatedDataStr = JSON.stringify(updatedData, null, 2);

        // Write the updated data back to the file
        await fs.writeFile(filePath, updatedDataStr, "utf8");
        console.log("Data appended successfully");
    } catch (err) {
        console.error("Error:", err);
    }
};
export function removeDiacritics(str) {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}
export const getEnding = (verb) => (verb.endsWith("ar") ? "AR" : verb.endsWith("er") ? "ER" : "IR");

export const PerformerEnum = [
    "YO",
    "TU",
    "EL_ELLA_USTED",
    "NOSOTROS_NOSOTRAS",
    "VOSOTROS_VOSOTRAS",
    "ELLOS_ELLAS_USTEDES"
    // "NON_FINITE"
];
export const EndingEnum = ["ER", "AR", "IR"];
export const MoodEnum = [
    "INDICATIVO"
    // "SUBJUNTIVO",
    // "IMPERATIVO_AFIRMATIVO",
    // "IMPERATIVO_NEGATIVO"
    // "NON_FINITE"
];

export const NonFiniteTenseEnum = ["INFINITIVO", "GERUNDIO", "PARTICIPIO"];
export const FiniteTenseEnum = [
    "PRESENTE",
    "PRETERITO",
    "IMPERFECTO",
    "FUTURO"
    // "CONDICIONAL",
    // "FUTURO_PERFECTO",
    // "PLUSCUAMPERFECTO",
    // "PRESENTE_PERFECTO",
    // "PRETERITO_ANTERIOR",
    // "CONDICIONAL_PERFECTO"
];

export const Verbs = [
    "tener",
    "estar",
    "ser",
    "ir",
    "hacer"
    // "decir",
    // "ver",
    // "dar",
    // "saber",
    // "querer",
    // "haber",
    // "pasar",
    // "parecer",
    // "llegar",
    // "dejar",
    // "seguir",
    // "encontrar",
    // "poner",
    // "llamar",
    // "sentir",
    // "creer",
    // "hablar",
    // "pedir",
    // "llevar",
    // "volver",
    // "pensar",
    // "mirar",
    // "empezar",
    // "salir",
    // "entrar",
    // "vivir",
    // "llegar",
    // "deber"
];
