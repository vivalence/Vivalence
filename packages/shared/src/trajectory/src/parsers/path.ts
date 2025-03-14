import { Signal, Pattern } from "../../types.ts";

// Path signal parser
export function signal(input: string): Signal[] {
  const normalized = input.startsWith("/") ? input : `/${input}`;
  return normalized
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => ({ type: "path", value: segment }));
}

// Path pattern parser
export function pattern(input: string): Pattern[] {
  const normalized = input.startsWith("/") ? input : `/${input}`;

  // First create match functions
  const matchFunctions = normalized
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => {
      if (segment.startsWith(":")) {
        // Parameter pattern
        const paramName = segment.substring(1);
        return (signal: Signal) => {
          // Return params if matched
          return { [paramName]: signal.value };
        };
      } else if (segment === "*") {
        // Wildcard pattern
        return (signal: Signal) => {
          // Always match wildcards with empty params
          return {};
        };
      } else {
        // Exact match pattern
        return (signal: Signal) => {
          // Return empty params if matched, null if not
          return signal.value === segment ? {} : null;
        };
      }
    });

  // Then create pattern objects
  return matchFunctions.map((matchFn) => ({
    type: "path",
    match: matchFn,
  }));
}
