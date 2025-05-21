import { Signal, Pattern } from "../types/index.ts";

export interface PathPattern {
  path: string;
  [key: string]: any | Record<any, any>;

  input?: Record<string, any>;
  output?: Record<string, any>;
  name?: string;
  valence?: string;
}

export interface PathDocs {
  segment: string;
  path: string;
  valence?: string;
  input?: Record<string, any>; // typebox
  output?: Record<string, any>; // typebox
}

export interface PathSignal {
  segment: string;
}

export function signal(input: string): Signal<PathSignal>[] {
  const normalized = input.startsWith("/") ? input : `/${input}`;
  const signals = normalized
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => new Signal<PathSignal>("path", { segment }));
  return signals;
}

export function pattern(
  input: string | PathPattern,
  valence: string | null,
): Pattern<PathSignal>[] {
  let path;
  let docs = {};

  if (typeof input === "string") {
    path = input;
    docs.path = path;

    if (typeof valence === "string") {
      docs.valence = valence;
    }
  } else {
    path = input.path;
    docs = { ...input };
  }

  const segments = path //(path.startsWith("/") ? path : `/${path}`)
    .split("/")
    .filter((segment) => segment.length > 0);

  const patterns = [];

  for (const segment of segments) {
    let segmentDocs: Record<string, any> = { segment };
    let segementMatchFn;

    if (segment.startsWith(":")) {
      const paramName = segment.substring(1);
      segmentDocs.param = paramName;
      segementMatchFn = (signal: Signal<any>) => {
        if (signal.type !== "path") return null;
        return { ...signal, params: { [paramName]: signal.value.segment } };
      };
    } else if (segment === "*") {
      segementMatchFn = (signal: Signal<any>) => {
        if (signal.type !== "path") return null;
        return signal;
      };
    } else {
      segementMatchFn = (signal: Signal<any>) => {
        if (signal.type !== "path") return null;
        return signal.value.segment === segment ? signal : null;
      };
    }

    const pattern = new Pattern<PathSignal>(
      "path",
      segementMatchFn,
      segmentDocs,
    );
    patterns.push(pattern);
  }

  patterns[patterns.length - 1].docs = {
    ...docs,
    ...patterns[patterns.length - 1].docs,
  };

  return patterns;
}

export const type = "path";
export default { signal, pattern, type };
