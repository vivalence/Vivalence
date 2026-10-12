import { raw } from "@mikro-orm/core";
import { traits } from "@vivalence/typology";
import { formula } from "../note/retained.js";
import { drivers } from "../../retention/index.js";
import { LEECH, UNRANKED } from "../../types.js";

const RETENTION = { $like: "retention.%" };
const RANK = raw(`coalesce(json_extract(l0.trait, '$.RANKED.rank'), ${UNRANKED})`);
const by = (user) => (user === undefined ? "" : ` and n.user_id = '${user}'`);
const DUE = (user) => raw(`(select json_extract(n.trait, '$.RETAINED.due') from Note n where n.literal_id = l0.id and n.slug like 'retention.%'${by(user)})`);
const STRENGTH = (user) => raw(`(select ${formula("n")} from Note n where n.literal_id = l0.id and n.slug like 'retention.%'${by(user)})`);

export const RETAINED = traits.define("RETAINED", {
  repository: {
    owner() {
      const params = this.getEntityManager().getContext().getFilterParams("user");
      return params?.user ? { user: params.user } : {};
    },

    awake(where, blacklist, clause) {
      const suspended = { notes: { $none: { ...this.owner(), slug: { $like: "suspension.%" } } } };
      return { ...where, id: { $nin: blacklist }, $and: [clause, suspended] };
    },

    async feed(where = {}, { limit, blacklist = [] } = {}) {
      const due = await this.due(where, { limit, blacklist });
      if (due.length >= limit) return due;
      const novel = await this.novel(where, { limit: limit - due.length, blacklist: [...blacklist, ...due.map((literal) => literal.id)] });
      return [...due, ...novel];
    },

    novel(where = {}, { limit, blacklist = [] } = {}) {
      const untouched = { notes: { $none: { ...this.owner(), slug: RETENTION } } };
      return this.find(this.awake(where, blacklist, untouched), { orderBy: { [RANK]: "ASC" }, limit, populate: ["notes"] });
    },

    due(where = {}, { limit, blacklist = [] } = {}) {
      const due = { notes: { ...this.owner(), slug: RETENTION, trait: { RETAINED: { due: { $lte: new Date().toISOString() } } } } };
      return this.find(this.awake(where, blacklist, due), { orderBy: { [DUE(this.owner().user)]: "ASC" }, limit, populate: ["notes"] });
    },

    byStrength(where = {}, { limit, blacklist = [] } = {}) {
      const retained = { notes: { ...this.owner(), slug: RETENTION } };
      return this.find(this.awake(where, blacklist, retained), { orderBy: { [STRENGTH(this.owner().user)]: "ASC" }, limit, populate: ["notes"] });
    },

    byStatus(where = {}, { status, limit, blacklist = [] } = {}) {
      const held = { notes: { ...this.owner(), slug: RETENTION, trait: { RETAINED: { status: { $in: status } } } } };
      return this.find(this.awake(where, blacklist, held), { orderBy: { [RANK]: "ASC" }, limit, populate: ["notes"] });
    },

    sample(where = {}, { limit, blacklist = [] } = {}) {
      const retained = { notes: { ...this.owner(), slug: RETENTION } };
      return this.find(this.awake(where, blacklist, retained), { orderBy: { [raw("random()")]: "asc" }, limit, populate: ["notes"] });
    },

    leeches(where = {}, { lapses = LEECH, limit } = {}) {
      const lapsed = { notes: { ...this.owner(), slug: RETENTION, trait: { RETAINED: { state: { lapses: { $gte: lapses } } } } } };
      return this.find({ ...where, $and: [lapsed] }, { orderBy: { [STRENGTH(this.owner().user)]: "ASC" }, limit, populate: ["notes"] });
    },

    async review(literal, { signal, mode = null, thread = null }) {
      const notes = this.entities.note;
      const held = await notes.retention(literal);
      const retention = held === null
        ? notes.create({ ...this.owner(), literal, slug: `retention.${literal.slug}`, traits: ["RETAINED"], trait: { RETAINED: {} } })
        : held;
      notes.evolve(retention, signal);
      const retained = retention.trait.RETAINED;
      notes.create({
        ...this.owner(),
        literal,
        parent: retention,
        slug: `trace.${crypto.randomUUID()}`,
        traits: ["TRACED"],
        trait: { TRACED: { signal, status: retained.status, snapshot: { state: retained.state, nextIn: retained.nextIn, due: retained.due }, mode, thread } },
      });
      await this.em.flush();
      return retention;
    },

    async preview(literal) {
      const held = await this.entities.note.retention(literal);
      return held === null ? drivers.SM2.preview(null) : drivers[held.trait.RETAINED.driver].preview(held.trait.RETAINED.state);
    },

    async history(literal) {
      const held = await this.entities.note.retention(literal);
      if (held === null) return [];
      const traces = await this.entities.note.traces(held);
      return traces.map((trace) => ({ at: trace.createdAt, ...trace.trait.TRACED }));
    },
  },
});
