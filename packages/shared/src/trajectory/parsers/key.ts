import { Signal, Pattern } from "../types/index.ts";

export interface KeyPattern {
  match: string;
  name?: string;
  description?: string;
  example?: string;
  format?: string;
  keyCase?: string;
  allowedModifiers?: string[];
  [key: string]: any;
}

export interface KeySignal {
  key: string;
  modifiers: string[];
}

export function signal(input: string): Signal<KeySignal>[] {
  return input
    .split(" ")
    .filter((key) => key.length > 0)
    .map((key) => {
      const parts = key.split("+");
      const keyValue = parts.pop() || "";
      const modifiers = parts;

      return new Signal<KeySignal>("key", {
        key: keyValue,
        modifiers,
      });
    });
}

export function pattern(input: string | KeyPattern): Pattern<KeySignal>[] {
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

  const keyPatterns = keyParts.map((key) => {
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

    return new Pattern<KeySignal>(
      "key",
      (signal: Signal<any>) => {
        if (signal.type !== "key") return null;

        const keyData = signal.value;
        const keyMatches = keyData.key.toLowerCase() === keyValue.toLowerCase();
        const modifiersMatch =
          modifiers.every((m) => keyData.modifiers.includes(m)) &&
          modifiers.length === keyData.modifiers.length;

        return keyMatches && modifiersMatch ? signal : null;
      },
      mergedDocs,
    );
  });
  return keyPatterns;
}

export const type = "key";

export default { signal, pattern, type };
