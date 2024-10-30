const parseLine = (line) => {
  if (!line || line.startsWith("#")) {
    return { type: "meta", content: line };
  }

  const [key, ...valueParts] = line.split("=");
  const value = valueParts.join("=");

  return {
    type: "entry",
    key: key?.trim(),
    value: value?.trim(),
  };
};

const transformLine =
  (config) =>
  ({ type, key, value, content }) => {
    if (type === "meta") return { type, content };

    if (value.startsWith("$")) {
      const configKey = value.slice(1); // Remove $ prefix
      const configValue = config.env.get(configKey);

      if (!configValue) {
        console.warn(`Warning: No value found for ${configKey}`);
      }

      return {
        type: "entry",
        key,
        value: configValue || "",
      };
    }

    return { type: "entry", key, value };
  };

const lineToString = ({ type, key, value, content }) => {
  if (type === "meta") return content;

  const formatValue = (value) => {
    // Handle null/undefined
    if (value === null || value === undefined) return '""';
    if (value === "[UNSET]") return '""';

    // Handle booleans and numbers directly
    if (typeof value === "boolean" || typeof value === "number") {
      return value.toString();
    }

    // Handle strings - always quote unless already quoted
    if (typeof value === "string") {
      return value.startsWith('"') && value.endsWith('"') ? value : `"${value}"`;
    }

    // Objects/arrays - JSON stringify and quote
    if (typeof value === "object") {
      return `"${JSON.stringify(value)}"`;
    }

    return `"${value}"`; // fallback - quote everything else
  };

  return `${key}=${formatValue(value)}`;
};
const processContent = (content, config) =>
  content.split("\n").map(parseLine).map(transformLine(config)).map(lineToString).join("\n");

const readFile = async (filepath) => {
  try {
    return await Deno.readTextFile(filepath);
  } catch (error) {
    console.error(`Failed to read ${filepath}:`, error);
    throw error;
  }
};

const writeFile = async (filepath, content) => {
  try {
    await Deno.writeTextFile(filepath, content);
    return true;
  } catch (error) {
    console.error(`Failed to write ${filepath}:`, error);
    throw error;
  }
};

const processEnvFile = async ({ from, to }, config) => {
  const content = await readFile(from);
  const processedContent = processContent(content, config);
  return writeFile(to, processedContent);
};

export default processEnvFile;
