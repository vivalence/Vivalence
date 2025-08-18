import { Parser, Signal, Pattern } from "../types/index.ts";

export interface SignaturePattern {
  path: string;

  input?: Record<string, any>;
  output?: Record<string, any>;
  name?: string;
  valence?: string;

  [key: string]: any | Record<any, any>;
}

export interface SignatureDocs {
  segment: string;
  path: string;
  valence?: string;
  input?: Record<string, any>; // typebox
  output?: Record<string, any>; // typebox
}

export interface SignatureSignal {
  segment: string;
}

const type = "sig";

function signal(input: string): Signal<SignatureSignal>[] {
  const normalized = input.startsWith("/") ? input : `/${input}`;
  const signals = normalized
    .split("/")
    .filter((segment) => segment.length > 0)
    .map((segment) => new Signal<SignatureSignal>(type, { segment }));
  return signals;
}

function pattern(
  input: string | SignaturePattern,
  valence: string | null,
): Pattern<SignatureSignal>[] {
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

  const segments = path // (path.startsWith("/") ? path : `/${path}`)
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
        if (signal.type !== type) return null;
        return { ...signal, params: { [paramName]: signal.value.segment } };
      };
    } else if (segment === "*") {
      segementMatchFn = (signal: Signal<any>) => {
        if (signal.type !== type) return null;
        return signal;
      };
    } else {
      segementMatchFn = (signal: Signal<any>) => {
        if (signal.type !== type) return null;
        return signal.value.segment === segment ? signal : null;
      };
    }

    const pattern = new Pattern<SignatureSignal>(
      type,
      segementMatchFn,
      segmentDocs,
    );
    pattern.slug = `${pattern.type}/${segment}`;
    patterns.push(pattern);
  }

  patterns[patterns.length - 1].docs = {
    ...docs,
    ...patterns[patterns.length - 1].docs,
  };

  return patterns;
}

export const sig = new Parser(type, pattern, signal);
export default sig;
