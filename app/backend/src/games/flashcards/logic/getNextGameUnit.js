import { prisma } from "../../../prisma-client.js";
import { getNewUnit, getDueUnit, getPrioritizedUnit } from "../../library/getGameUnits.js";

export const getNextGameUnit = async ({ blacklist, curriculumId, gameId, type = "WORD" }) => {
    // console.log("getNextGameUnit props", { blacklist, curriculumId, gameId, type });
    try {
        const input = {
            blacklist,
            curriculumId,
            gameId,
            now: new Date(),
        };

        const prioritizedUnit = await getPrioritizedUnit(input);
        if (prioritizedUnit) return prioritizedUnit;

        const dueUnit = await getDueUnit(input);
        if (dueUnit) return dueUnit;

        const newUnit = await getNewUnit(input);
        if (newUnit) return newUnit;

        console.log("No items to practice now");
        return null;
    } catch (err) {
        console.error(`Error fetching next review item: ${err}`);
        throw err; // or handle the error as you see fit
    }
};
