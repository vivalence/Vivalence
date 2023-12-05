import { promises as fs } from "fs";

import readline from "readline";

export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export const askYesNoQuestion = async (question) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    return new Promise((resolve) => {
        rl.question(`${question} (Y/N): `, (answer) => {
            const response = answer.trim().toUpperCase();
            rl.close();
            resolve(response === "Y");
        });
    });
};

export const writeToFile = async (data, filePath, overwrite = false) => {
    if (overwrite) await fs.unlink(filePath);
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

export const getEnding = (verb) => {
    verb = removeDiacritics(verb).toLowerCase();
    return verb.endsWith("ar") ? "AR" : verb.endsWith("er") ? "ER" : "IR";
};

export const PerformerEnum = [
    "YO",
    "TU",
    "EL_ELLA_USTED",
    "NOSOTROS_NOSOTRAS",
    "VOSOTROS_VOSOTRAS",
    "ELLOS_ELLAS_USTEDES",
    // "NON_FINITE",
];
export const ImperativeConjugationMap = {
    "IMPERATIVO_AFIRMATIVO:NON_TEMPORAL": {
        YO: false, // "Yo" does not have an affirmative imperative form
        TU: true, // "Tú" has an affirmative imperative form
        EL_ELLA_USTED: false, // "Él/Ella/Usted" has an affirmative imperative form
        NOSOTROS_NOSOTRAS: true, // "Nosotros/Nosotras" has an affirmative imperative form
        VOSOTROS_VOSOTRAS: true, // "Vosotros/Vosotras" has an affirmative imperative form
        ELLOS_ELLAS_USTEDES: false, // "Ellos/Ellas/Ustedes" has an affirmative imperative form
    },
    "IMPERATIVO_NEGATIVO:NON_TEMPORAL": {
        YO: false, // "Yo" does not have a negative imperative form
        TU: true, // "Tú" has a negative imperative form
        EL_ELLA_USTED: false, // "Él/Ella/Usted" has a negative imperative form
        NOSOTROS_NOSOTRAS: true, // "Nosotros/Nosotras" has a negative imperative form
        VOSOTROS_VOSOTRAS: true, // "Vosotros/Vosotras" has a negative imperative form
        ELLOS_ELLAS_USTEDES: false, // "Ellos/Ellas/Ustedes" has a negative imperative form
    },
};

export const ConjugationMap = {
    // mood:tense
    "NON_FINITE:INFINITIVO": 1,
    "NON_FINITE:GERUNDIO": 1,
    "NON_FINITE:PARTICIPIO": 1,

    "IMPERATIVO_AFIRMATIVO:NON_TEMPORAL": 3,
    "IMPERATIVO_NEGATIVO:NON_TEMPORAL": 3,

    "INDICATIVO:PRESENTE": 6,
    "INDICATIVO:PRETERITO": 6,
    "INDICATIVO:IMPERFECTO": 6,
    "INDICATIVO:FUTURO": 6,
    "INDICATIVO:CONDICIONAL": 6,
    "INDICATIVO:FUTURO_PERFECTO": 6,
    // "INDICATIVO:PLUSCUAMPERFECTO": 6,
    // "INDICATIVO:PRESENTE_PERFECTO": 6,
    // "INDICATIVO:PRETERITO_ANTERIOR": 6,
    // "INDICATIVO:CONDICIONAL_PERFECTO": 6,

    "SUBJUNTIVO:PRESENTE": 6,
    "SUBJUNTIVO:IMPERFECTO": 6,
    // "SUBJUNTIVO:FUTURO": 6,
    // "SUBJUNTIVO:FUTURO_PERFECTO": 6,
    // "SUBJUNTIVO:PLUSCUAMPERFECTO": 6,
    // "SUBJUNTIVO:PRESENTE_PERFECTO": 6,
};

export const EndingEnum = ["ER", "AR", "IR"];
export const MoodEnum = [
    "INDICATIVO",
    "SUBJUNTIVO",
    "IMPERATIVO_AFIRMATIVO",
    "IMPERATIVO_NEGATIVO",
    // "NON_FINITE",
];

export const NonFiniteTenseEnum = ["INFINITIVO", "GERUNDIO", "PARTICIPIO"];
export const FiniteTenseEnum = [
    "PRESENTE",
    "PRETERITO",
    "IMPERFECTO",
    "FUTURO",
    "CONDICIONAL",
    "FUTURO_PERFECTO",
    "PLUSCUAMPERFECTO",
    "PRESENTE_PERFECTO",
    "PRETERITO_ANTERIOR",
    "CONDICIONAL_PERFECTO",
];

export const Verbs = [
    "tener",
    "estar",
    "ser",
    "ir",
    "hacer",
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
