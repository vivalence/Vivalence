import { drivers } from "./retention/index.js";

const noted = (literal, trait) => literal.notes.getItems().find((note) => note.traits.includes(trait)) ?? null;
const asset = (literal, trait) => (literal.traits.includes(trait) ? literal.trait[trait].asset.path : null);

export const card = (literal) => {
  const retention = noted(literal, "RETAINED");
  const held = retention === null ? null : retention.trait.RETAINED;
  return {
    slug: literal.slug,
    ontology: literal.ontology,
    known: literal.trait.TRANSLATED.known,
    learning: literal.trait.TRANSLATED.learning,
    example: literal.traits.includes("EXEMPLIFIED") ? literal.trait.EXEMPLIFIED : null,
    voice: asset(literal, "VOCALIZED"),
    picture: asset(literal, "DEPICTED"),
    status: held === null ? "UNTOUCHED" : held.status,
    due: held === null ? null : held.due,
    lapses: held === null ? 0 : held.state.lapses,
    suspended: noted(literal, "SUSPENDED") !== null,
    preview: drivers.SM2.preview(held === null ? null : held.state),
  };
};
