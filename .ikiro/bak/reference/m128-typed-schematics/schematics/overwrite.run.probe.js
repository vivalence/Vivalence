import "@vivalence/typology";
import { overwrite as whole } from "./overwrite.whole.ts";
import { overwrite } from "../../../../subsystems/typology/schematics/traits/overwrite.js";
import { Conversational, Harnessed } from "../../../../subsystems/typology/schematics/traits/index.js";
for (const trait of [Harnessed, Conversational]) console.log(JSON.stringify(whole(trait)) === JSON.stringify(overwrite(trait)));
