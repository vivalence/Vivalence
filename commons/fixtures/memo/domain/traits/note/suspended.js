import { traits, v } from "@vivalence/typology";

export const SUSPENDED = traits.define("SUSPENDED", {
  schematic: v.object({ at: v.number(), reason: v.string().default("") }),
  repository: {
    suspension(literal) {
      return this.findOne({ ...this.owner(), slug: `suspension.${literal.slug}` });
    },
    async suspend(literal, reason) {
      const held = await this.suspension(literal);
      if (held !== null) return held;
      const note = this.create({ ...this.owner(), literal, slug: `suspension.${literal.slug}`, traits: ["SUSPENDED"], trait: { SUSPENDED: { at: Date.now(), reason } } });
      await this.em.flush();
      return note;
    },
    async resume(literal) {
      const held = await this.suspension(literal);
      if (held === null) return false;
      this.em.remove(held);
      await this.em.flush();
      return true;
    },
  },
});
