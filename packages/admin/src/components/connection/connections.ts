import supabase from "$util/supabaseClient";
import {
    type ConnectionTypeMethods,
    type ConnectionTypesInterface,
} from "./types";
// next: export ConnectionTypeMethods;

import { UnitToTag, StrategyToTag } from "./connections/toTag";
import {
    GameToStrategy,
    TagToStrategy,
    UserToStrategy,
    UnitToStrategy,
} from "./connections/toStrategy";
import { StrategyToGame } from "./connections/toGame";
import { StrategyToUser } from "./connections/toUser";
import { StrategyToUnit, TagToUnit } from "./connections/toUnit";

export const ConnectionTypes: ConnectionTypesInterface = {
    StrategyToUser: StrategyToUser,

    UserToStrategy: UserToStrategy,
    GameToStrategy: GameToStrategy,
    TagToStrategy: TagToStrategy,
    UnitToStrategy: UnitToStrategy,

    StrategyToUnit: StrategyToUnit,
    TagToUnit: TagToUnit,

    StrategyToTag: StrategyToTag,
    UnitToTag: UnitToTag,

    StrategyToGame: StrategyToGame,
};
