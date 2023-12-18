import MemoryModel from "./MemoryModel.js";
import GameUnitRelation from "./GameUnitRelation.js";

export default async function ({ gameId, gameType, unitId, response }) {
    const { nextPlay, memoryModel } = await MemoryModel.handle({ unitId, gameType, response });
    const gameUnitRelation = await GameUnitRelation.handle({ gameId, unitId, response, nextPlay });
    return { unitId, state: memoryModel.state, nextPlay };
}
