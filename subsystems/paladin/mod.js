import { steer } from "@vivalence/typology";
import { paladin as wafer } from "./wafer.js";
import * as resolve from "./lifecycle/resolve.js";
import * as integrate from "./lifecycle/integrate.js";

const paladin = await steer.invoke(wafer(), "/construct/populate/base")(); // ugh. replace with selbstbestimmt and dossier pattern.

paladin.ikiro = (async () => {
  // await resolve.circuitry(paladin);
  await resolve.variant(paladin);
  await integrate.statements(paladin);
  await integrate.publish(paladin);
  await integrate.questions(paladin);
  await integrate.validate(paladin);
  // console.log(JSON.stringify(paladin., null, 2));
})();

export default paladin;
