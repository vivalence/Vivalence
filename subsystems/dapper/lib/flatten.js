export const ZONE_COUNT = 6;

export const ZONE = { Z0: 0, Z1: 1, Z2: 2, Z3: 3, Z4: 4, Z5: 5 };

const INTERACTIVE_ROLES = ["primary", "secondary", "accent", "info", "success", "warning", "danger"];

const STATES = ["base", "hover", "active"];

function emitZoneBlock(zone) {
  let block = "";
  block += `  --zone-surface: ${zone.surface};\n`;
  block += `  --zone-contrast: ${zone.contrast};\n`;
  block += `  --zone-boundary: ${zone.boundary};\n`;
  for (const role of INTERACTIVE_ROLES) {
    if (!zone[role]) continue;
    for (const state of STATES) {
      block += `  --zone-${role}-${state}: ${zone[role][state]};\n`;
    }
  }
  if (zone.error) {
    block += `  --zone-error-surface: ${zone.error.surface};\n`;
    block += `  --zone-error-contrast: ${zone.error.contrast};\n`;
    block += `  --zone-error-boundary: ${zone.error.boundary};\n`;
  }
  return block;
}

export function generateZoneCSS({ themes }) {
  let css = "";

  for (const [themeName, theme] of Object.entries(themes)) {
    const zones = theme.zones;
    if (!zones) continue;

    if (theme.fonts) {
      css += `:root[data-theme="${themeName}"] {\n`;
      if (theme.fonts.heading) css += `  --zone-font-heading: ${theme.fonts.heading};\n`;
      if (theme.fonts.body) css += `  --zone-font-body: ${theme.fonts.body};\n`;
      if (theme.fonts.code) css += `  --zone-font-code: ${theme.fonts.code};\n`;
      css += "}\n\n";
    }

    for (let index = 0; index < zones.length; index++) {
      const zone = zones[index];
      if (!zone) continue;
      css += `:root[data-theme="${themeName}"] .zone-${index} {\n`;
      css += emitZoneBlock(zone);
      css += "}\n\n";
    }
  }

  return css;
}

export const generateCSS = (ds) => {
  const { themes } = ds;
  const warnings = new Set();
  let css = "";

  Object.entries(themes).forEach(([themeName, theme]) => {
    css += `:root[data-theme="${themeName}"] {\n`;

    Object.entries(theme).forEach(([category, tokens]) => {
      if (category === "zones" || category === "fonts") return;
      if (!tokens || typeof tokens !== "object") {
        warnings.add(`Missing or invalid ${category} tokens in ${themeName} theme`);
        return;
      }
      const flatTokens = flattenObject(tokens, category, theme);

      Object.entries(flatTokens).forEach(([path, value]) => {
        if (value === undefined || value === null) {
          warnings.add(`Invalid value for --${path} in ${themeName} theme`);
          return;
        }
        const cssValue = Array.isArray(value) ? value.join(", ") : value;
        css += `  --${path}: ${cssValue};\n`;
      });
    });

    css += "}\n\n";
  });

  css += generateZoneCSS({ themes });

  if (warnings.size > 0) {
    console.warn("Theme generation warnings:\n", [...warnings].join("\n"));
  }

  return { output: { css } };
};

export const processValue = (value, theme) => {
  if (typeof value === "function") {
    try {
      return value(theme);
    } catch (error) {
      console.error(`Error processing theme function:`, error);
      return "initial";
    }
  }
  return value;
};

export const flattenObject = (obj, prefix = "", theme) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    const newPrefix = prefix ? `${prefix}-${key}` : key;

    if (value === null || value === undefined) {
      return acc;
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      return {
        ...acc,
        ...flattenObject(value, newPrefix, theme),
      };
    }

    const processedValue = processValue(value, theme);
    if (processedValue !== undefined) {
      acc[newPrefix] = processedValue;
    }

    return acc;
  }, {});
};
