import config from "@vivalence/config";

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

const uppercaseEnv = (env) =>
  Object.fromEntries(Object.entries(env).map(([key, value]) => [key.toUpperCase(), value]));

const transformLine =
  (env) =>
  ({ type, key, value, content }) => {
    if (type === "meta") return { type, content };

    if (value.startsWith("$")) {
      const configKey = value.slice(1); // Remove $ prefix
      const configValue = env[configKey.toUpperCase()] ?? config.env.get(configKey);

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
    if (value === null || value === undefined) return '""';
    if (value === "[UNSET]") return '""';

    if (typeof value === "boolean" || typeof value === "number") {
      return value.toString();
    }

    if (typeof value === "string") {
      return value.startsWith('"') && value.endsWith('"') ? value : `"${value}"`;
    }

    if (typeof value === "object") {
      return `"${JSON.stringify(value)}"`;
    }

    return `"${value}"`;
  };

  return `${key}=${formatValue(value)}`;
};

const processEnvContent = (content, env) => {
  return content //
    .split("\n")
    .map(parseLine)
    .map(transformLine(env))
    .map(lineToString)
    .join("\n");
};

export default {
  fromEnv: async (sourceEnvPath, env = {}) => {
    const envPath = sourceEnvPath.replace(".env.source", ".env");

    const sourceEnvContent = await Deno.readTextFile(sourceEnvPath);
    const envContent = processEnvContent(sourceEnvContent, uppercaseEnv(env));
    await Deno.writeTextFile(envPath, envContent);

    return envPath;
  },
  fromExampleEnv: async (exampleEnvPath) => {
    const envPath = exampleEnvPath.replace(".env.example", ".env");
    const exampleEnvContent = await Deno.readTextFile(exampleEnvPath);

    const envContent = processEnvContent(exampleEnvContent);

    await Deno.writeTextFile(envPath, envContent);
    return envPath;
  },
};
