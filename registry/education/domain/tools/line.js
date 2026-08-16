export const line = (literal) =>
  [
    literal.slug,
    `${literal.trait?.TRANSLATED?.learning ?? ""} (${literal.trait?.TRANSLATED?.known ?? ""})`,
    literal.ontology,
    literal.retention?.status ?? "UNTOUCHED",
  ].join(" · ");
