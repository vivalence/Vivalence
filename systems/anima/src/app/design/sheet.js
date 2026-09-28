const THEME = /^:root\[data-theme="([a-z0-9-]+)"\]/;
const ZONE = /="(\d)"\]$/;

const rules = (sheet) => {
  try {
    return [...sheet.cssRules];
  } catch {
    return [];
  }
};

export const read = (sheets) => {
  const held = {};
  for (const rule of [...sheets].flatMap(rules)) {
    const selector = rule.selectorText ?? "";
    const theme = THEME.exec(selector)?.[1];
    if (!theme) continue;
    const names = [...rule.style].filter((name) => name.startsWith("--"));
    if (!names.includes("--surface")) continue;
    const zone = selector.includes(" ") ? ZONE.exec(selector)?.[1] : "root";
    if (!zone) continue;
    held[theme] ??= {};
    held[theme][zone] = { selector, values: Object.fromEntries(names.map((name) => [name, rule.style.getPropertyValue(name).trim()])) };
  }
  return held;
};

export const css = ({ selector, values }) => `${selector} {\n${Object.entries(values).map(([name, value]) => `  ${name}: ${value};`).join("\n")}\n}`;

export const colour = (value) => /^(#[0-9A-Fa-f]{6}|rgba\()/.test(value);
