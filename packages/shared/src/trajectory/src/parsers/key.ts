import { Signal, Pattern } from "../../types.ts";

// Key signal parser
export function signal(input: string): Signal[] {
  // Split by space for key sequences
  return input
    .split(" ")
    .filter((key) => key.length > 0)
    .map((key) => {
      // Parse key to handle modifiers
      const parts = key.split("+");
      const keyValue = parts.pop() || "";
      const modifiers = parts;

      return {
        type: "key",
        value: {
          key: keyValue,
          modifiers: modifiers,
        },
      };
    });
}

// Key pattern parser
export function pattern(input: string): Pattern[] {
  // Map to create match functions
  const matchFunctions = input
    .split(" ")
    .filter((key) => key.length > 0)
    .map((key) => {
      // Exact match pattern
      const parts = key.split("+");
      const keyValue = parts.pop() || "";
      const modifiers = parts;

      return (signal: Signal) => {
        const keyData = signal.value;
        const keyMatches = keyData.key.toLowerCase() === keyValue.toLowerCase();
        const modifiersMatch =
          modifiers.every((m) => keyData.modifiers.includes(m)) &&
          modifiers.length === keyData.modifiers.length;

        // Return empty params if matched, null if not
        return keyMatches && modifiersMatch ? {} : null;
      };
    });

  // Then create pattern objects
  return matchFunctions.map((matchFn) => ({
    type: "key",
    match: matchFn,
  }));
}
