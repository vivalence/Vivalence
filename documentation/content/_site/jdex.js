export const AREAS = {
  // 0: { title: "Meta", note: "the docs system itself" },
  10: { title: "About", note: "what vivalence is, and why" },
  20: { title: "Grammar", note: "language, vocabulary, semantics" },
  30: { title: "Architecture", note: "functional composition" },
  40: { title: "Repository", note: "filesystem reality + walks" },
  50: { title: "Practice", note: "how-to, criteria, conventions" },
  // 60: { title: "Trajectory", note: "development time axis" },
  // 70: { title: "Reserved", note: "" },
  // 80: { title: "Reserved", note: "" },
  // 90: { title: "Reserved", note: "" },
};

export const CATEGORIES = {
  0: "management",

  10: "management",
  11: "identity",
  12: "vision",
  13: "license",
  15: "history",

  20: "management",
  21: "glossary",

  30: "management",
  31: "map",
  32: "runtime",
  33: "daemon",
  34: "modes",
  35: "data",
  36: "clients",
  37: "registry",
  38: "services",

  40: "management",
  42: "typology",
  46: "kajuit",
  47: "integration",

  50: "management",
  52: "tutorials",
  53: "authoring",

  60: "management",
  61: "now",
  62: "next",
  63: "later",
  64: "out-of-scope",
};

export const decadeOf = (category) => Math.floor(category / 10) * 10;

export const areaKey = (decade) =>
  `${String(decade).padStart(2, "0")}–${String(decade + 9).padStart(2, "0")}`;

export const areaName = (key) => AREAS[Number(String(key).split("–")[0])]?.title ?? "";

export const areaNote = (key) => AREAS[Number(String(key).split("–")[0])]?.note ?? "";

export const categoryName = (category) => CATEGORIES[category] ?? String(category);

export const isReserved = (decade) => AREAS[decade]?.title === "Reserved";
