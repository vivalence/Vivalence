import { raw } from "@mikro-orm/core";
import { traits, v } from "@vivalence/typology";
import { drivers } from "../../retention/index.js";
import { STATUS } from "../../types.js";

const at = (field, alias = "n0") => `json_extract(${alias}.trait, '$.RETAINED.${field}')`;
export const formula = (alias) =>
  `CASE ${at("driver", alias)} ${Object.entries(drivers).map(([name, driver]) => `WHEN '${name}' THEN ${driver.sql.strength((field) => at(field, alias))}`).join(" ")} END`;
const DUE = raw(at("due"));
const STRENGTH = raw(formula("n0"));

export const schematic = v.object({
  driver: v.enum(Object.keys(drivers)).default("SM2"),
  status: v.enum(STATUS).default("UNTOUCHED"),
  type: v.enum(["INDIVIDUAL", "COLLECTIVE"]).default("INDIVIDUAL"),
  lastSignal: v.string().optional(),
  lastAt: v.number().optional(),
  nextIn: v.number().optional(),
  due: v.string().optional(),
  state: v.any().default(null),
});

export const RETAINED = traits.define("RETAINED", {
  schematic,
  repository: {
    owner() {
      const params = this.getEntityManager().getContext().getFilterParams("user");
      return params?.user ? { user: params.user } : {};
    },
    retention(literal) {
      return this.findOne({ ...this.owner(), slug: `retention.${literal.slug}` });
    },
    evolve(note, signal) {
      const held = this.claim(note, "RETAINED");
      const driver = drivers[held.driver];
      const given = { enum: signal };
      const result = held.lastAt === undefined ? driver.encode(given) : driver.evolve(given, held);
      note.trait = {
        ...note.trait,
        RETAINED: { ...held, state: result.state, status: result.status, nextIn: result.nextIn, due: new Date(result.nextAt).toISOString(), lastAt: Date.now(), lastSignal: signal },
      };
      return note;
    },
    due(where = {}, options = {}) {
      return this.find({ ...where, ...this.owner(), slug: { $like: "retention.%" }, [DUE]: { $lte: new Date().toISOString() } }, { ...options, orderBy: { [DUE]: "asc" } });
    },
    byStrength(where = {}, options = {}) {
      return this.find({ ...where, ...this.owner(), slug: { $like: "retention.%" } }, { ...options, orderBy: { [STRENGTH]: "asc" } });
    },
    traces(retention) {
      return this.find({ ...this.owner(), parent: retention.id }, { orderBy: { createdAt: "asc" } });
    },
    assess(note, now = Date.now()) {
      const held = this.claim(note, "RETAINED");
      return {
        status: held.status,
        due: held.due,
        strength: drivers[held.driver].strength(held, now),
        is: {
          weak: held.status === "UNKNOWN" || held.status === "LEARNING",
          familiar: held.status === "LEARNING" || held.status === "KNOWN",
          strong: held.status === "KNOWN" || held.status === "GRADUATED",
          succeeded: held.lastSignal === "GOOD" || held.lastSignal === "EASY",
          failed: held.lastSignal === "AGAIN",
        },
      };
    },
  },
});
