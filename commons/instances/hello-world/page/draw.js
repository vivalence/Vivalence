// esbuild leaves an https: specifier EXTERNAL — the artifact ships it verbatim, past the
// integrity hash, and the browser fetches and runs it at mount. gestalten/bundle/svelte.js:14
// claims only /^@vivalence\//, so nothing downstream refuses it. See ** the resolution law.
// every form esbuild passes through, not just `from`.
const EXTERNAL = /\b(from|import)\s*\(?\s*["']https?:\/\//;

export const external = (source) => EXTERNAL.test(source);

export const refuse = (source) => {
  if (external(source)) {
    throw new Error("refused: a drawn component may not import from a URL");
  }
  return source;
};
