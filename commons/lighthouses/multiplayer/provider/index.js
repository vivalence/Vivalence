import { Connection } from "@vivalence/typology";
import { Lighthouse } from "@vivalence/runtime";

export default function provider(mask, { connection = new Connection(mask.statics.remote), ...options } = {}) {
  return new Lighthouse(connection, options);
}
