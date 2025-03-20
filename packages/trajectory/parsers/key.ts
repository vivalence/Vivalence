import { Signal } from "../src/signal.ts";
import { Pattern, type PatternDocs } from "../src/pattern.ts";

export interface KeySignalValue {
  key: string;
  modifiers: string[];
}

export function signal(input: string): Signal<KeySignalValue>[] {
  return input
    .split(" ")
    .filter((key) => key.length > 0)
    .map((key) => {
      const parts = key.split("+");
      const keyValue = parts.pop() || "";
      const modifiers = parts;

      return new Signal<KeySignalValue>("key", {
        key: keyValue,
        modifiers,
      });
    });
}

export interface KeyPatternInput {
  match: string;
  name?: string;
  description?: string;
  example?: string;
  format?: string;
  keyCase?: string;
  allowedModifiers?: string[];
  [key: string]: any;
}

export function pattern(input: string | KeyPatternInput): Pattern<KeySignalValue>[] {
  // Extract the key string and any custom docs from the input
  let keyStr: string;
  let customDocs: Record<string, any> = {};

  if (typeof input === "string") {
    keyStr = input;
  } else {
    keyStr = input.match;
    // Copy all properties except 'match' to customDocs
    customDocs = { ...input };
    delete customDocs.match;
  }

  const keyParts = keyStr.split(" ").filter((key) => key.length > 0);

  return keyParts.map((key) => {
    const parts = key.split("+");
    const keyValue = parts.pop() || "";
    const modifiers = parts;

    const defaultDocs = {
      description: `Matches the key "${keyValue}" ${modifiers.length > 0 ? `with modifiers: ${modifiers.join("+")}` : "without modifiers"}`,
      example: key,
      format: modifiers.length > 0 ? "modifier+...+key" : "key",
      keyCase: "case-insensitive",
      allowedModifiers: ["Ctrl", "Alt", "Shift", "Meta"],
    };

    // Merge the default docs with any custom docs
    const mergedDocs = {
      ...defaultDocs,
      ...customDocs,
    };

    return new Pattern<KeySignalValue>(
      "key",
      (signal: Signal<any>) => {
        if (signal.type !== "key") return null;

        const keyData = signal.value;
        const keyMatches = keyData.key.toLowerCase() === keyValue.toLowerCase();
        const modifiersMatch =
          modifiers.every((m) => keyData.modifiers.includes(m)) &&
          modifiers.length === keyData.modifiers.length;

        return keyMatches && modifiersMatch ? {} : null;
      },
      mergedDocs,
    );
  });
}
export const type = "key";
export default { signal, pattern, type };
