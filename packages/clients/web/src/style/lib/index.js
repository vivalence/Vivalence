export const generateCSS = ({ themes }) => {
  const warnings = new Set();
  let css = "";
  Object.entries(themes).forEach(([themeName, theme]) => {
    css += `:root[data-theme="${themeName}"] {\n`;

    Object.entries(theme).forEach(([category, tokens]) => {
      if (!tokens || typeof tokens !== "object") {
        warnings.add(
          `Missing or invalid ${category} tokens in ${themeName} theme`,
        );
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

    // if (themeName === "dark" || themeName === "light") {css += `@media (prefers-color-scheme: ${themeName}) {\n`; css += `  :root:not([data-theme]) {\n`; Object.entries(tokenCategories).forEach(([category, tokens]) => {const flatTokens = flattenObject(tokens, category, theme); Object.entries(flatTokens).forEach(([path, value]) => {if (value !== undefined && value !== null) {const cssValue = Array.isArray(value) ? value.join(", ") : value; css += `    --${path}: ${cssValue};\n`;}});}); css += "  }\n}\n\n";}
  });

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
export const formatCSSValue = (value, type) => {
  if (value === undefined || value === null) return null;

  switch (type) {
    case "color":
      // Handle color values
      return value.startsWith("#") ||
        value.startsWith("rgb") ||
        value.startsWith("hsl")
        ? value
        : null;
    case "length":
      // Handle spacing/size values
      return typeof value === "number" ? `${value}px` : value;
    case "shadow":
      // Handle box-shadow values
      return Array.isArray(value) ? value.join(", ") : value;
    default:
      return value;
  }
};
