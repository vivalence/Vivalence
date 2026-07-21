import { View, bundle as compiler, crypto } from "@vivalence/typology";

const ARTIFACT = /^\/?[0-9a-f]{16}\.(svelte|html)\.mjs$/;
const missing = (error) => {
  if (error instanceof Deno.errors.NotFound) return null;
  throw error;
};

export default function bundler(paladin) {
  const imports = () => ({
    "@vivalence/typology": paladin.scope.repository.branch("subsystems/typology/mod.client.js").absolute,
    "@vivalence/drapes": paladin.scope.repository.branch("subsystems/drapes/mod.js").absolute,
  });

  const kinds = {
    svelte: {
      ext: "svelte",
      compile: async (entry) =>
        (await compiler.svelte(entry, { prod: paladin.is.prod, imports: imports() })).find(
          (output) => output.path === entry,
        ).text,
    },
    html: {
      ext: "html",
      compile: async (entry) => {
        const html = await paladin.read.text(entry);
        return `const html = ${JSON.stringify(html)};\nexport default (target) => { target.innerHTML = html; return { destroy: () => { target.innerHTML = ""; } }; };`;
      },
    },
  };

  paladin.bundler = (directory) => {
    const at = (name) => `${directory}/bundle/${name}`;

    const bundle = async ({ kind = "svelte", source = null, entry = null }) => {
      if (!kinds[kind]) throw new Error(`bundle: unknown kind "${kind}" — one of ${Object.keys(kinds)}`);
      if (source === null && entry === null) throw new Error("bundle: source or entry required");
      let hash = null;
      let text = null;
      if (source !== null) {
        if (!source.trim()) throw new Error("bundle: source is empty");
        hash = await crypto.digest(source);
        text = await paladin.read.text(at(`${hash.slice(0, 16)}.${kind}.mjs`)).catch(missing);
        if (text === null) {
          entry = at(`${hash.slice(0, 16)}.${kinds[kind].ext}`);
          await paladin.state.text(entry, source);
        }
      }
      if (text === null) {
        text = await kinds[kind].compile(entry);
        hash ??= await crypto.digest(text);
        await paladin.state.text(at(`${hash.slice(0, 16)}.${kind}.mjs`), text);
      }
      const mount = `/${hash.slice(0, 16)}.${kind}.mjs`;
      return new View({
        kind,
        hash,
        mount,
        bundle: { entries: [{ type: "js", mount, integrity: await crypto.digest(text), bytes: text.length }] },
      });
    };

    const serve = async (name) => {
      const stem = name.replace(/^\//, "");
      if (!ARTIFACT.test(stem)) return null;
      const text = await paladin.read.text(at(stem)).catch(missing);
      return text === null ? null : { text, type: "application/javascript", integrity: await crypto.digest(text) };
    };

    const inspect = async (hash) => {
      for (const { ext } of Object.values(kinds)) {
        const text = await paladin.read.text(at(`${hash.slice(0, 16)}.${ext}`)).catch(missing);
        if (text !== null) return { hash: await crypto.digest(text), source: text };
      }
      throw new Error(`bundler.inspect: unknown view: ${hash}`);
    };

    return { bundle, serve, inspect };
  };
}
