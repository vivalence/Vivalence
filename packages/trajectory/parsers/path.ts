import { Signal } from "../src/signal.ts";
import { Pattern, type PatternDocs } from "../src/pattern.ts";

export interface PathPatternInput {
  match: string;
  name?: string;
  description?: string;
  [key: string]: any;
}

export function signal(input: string): Signal<string>[] {
  const normalized = input.startsWith("/") ? input : `/${input}`;
  // console.log("signal input, normalized", input, normalized);
  const signals = normalized
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => new Signal<string>("path", segment));
  // console.log("sinals", input, signals);
  return signals;
}

export function pattern(input: string | PathPatternInput): Pattern<string>[] {
  // console.log("path input", input);
  let pathStr: string;
  let customDocs: Record<string, any> = {};

  if (typeof input === "string") {
    pathStr = input;
  } else {
    pathStr = input.match;
    customDocs = { ...input };
    delete customDocs.match;
  }

  const normalized = pathStr.startsWith("/") ? pathStr : `/${pathStr}`;
  const segments = normalized.split("/").filter((segment) => segment.length > 0);

  const patterns = segments.map((segment) => {
    let defaultDocs: Record<string, any> = {};
    let matchFn;

    if (segment.startsWith(":")) {
      const paramName = segment.substring(1);
      matchFn = (signal: Signal<any>) => {
        if (signal.type !== "path") return null;
        return { [paramName]: signal.value };
      };

      defaultDocs = {
        // type: "dynamic",
        // description: `Captures any value as parameter "/:${paramName}"`,
        // example: `For path "users/123", the value "123" would be captured as "${paramName}"`,
        param: paramName,
      };
    } else if (segment === "*") {
      matchFn = (signal: Signal<any>) => {
        if (signal.type !== "path") return null;
        return {};
      };

      defaultDocs = {
        // type: "wildcard",
        // description: "Matches any value (wildcard)",
        // example: "Matches any segment in this position",
      };
    } else {
      matchFn = (signal: Signal<any>) => {
        if (signal.type !== "path") return null;
        return signal.value === segment ? {} : null;
      };

      defaultDocs = {
        // type: "static",
        // description: `Matches the exact segment "/${segment}"`,
        signal: "/" + segment,
        // example: `Only matches "/${segment}" exactly`,
      };
    }

    // Merge the default docs with any custom docs
    const mergedDocs = {
      ...defaultDocs,
      ...customDocs,
    };

    const pattern = new Pattern<string>("path", matchFn, mergedDocs);
    return pattern;
  });
  return patterns;
}

export const type = "path";
export default { signal, pattern, type };
