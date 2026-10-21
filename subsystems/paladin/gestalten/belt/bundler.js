import { dirname } from "@std/path";
import * as esbuild from "esbuild";
import { Bundle, bundle as compiler, crypto, mime } from "@vivalence/typology";

const stem = (type) => type.replace(`${mime.VENDOR}.`, "").replace(/\+javascript$/, "");
const missing = (error) => {
  if (error instanceof Deno.errors.NotFound) return null;
  throw error;
};

const universal = {
  name: "solid-universal",
  setup(build) {
    build.onLoad({ filter: /\.jsx$/ }, async (file) => {
      const [{ transformAsync }, { default: solid }] = await Promise.all([import("@babel/core"), import("babel-preset-solid")]);
      const transformed = await transformAsync(await Deno.readTextFile(file.path), {
        filename: file.path,
        configFile: false,
        babelrc: false,
        presets: [[solid, { generate: "universal", moduleName: "@opentui/solid" }]],
      });
      return { contents: transformed.code, loader: "js" };
    });
  },
};

export default function bundler(paladin) {
  const imports = () => ({
    "@vivalence/typology": paladin.scope.repository.branch("subsystems/typology/mod.client.js").absolute,
    "@vivalence/drapes": paladin.scope.repository.branch("subsystems/drapes/mod.js").absolute,
    "@vivalence/drapes/": `${paladin.scope.repository.branch("subsystems/drapes").absolute}/`,
  });

  const rows = {
    [mime.dom.svelte]: async (entry) =>
      (await compiler.svelte(entry, {
        prod: paladin.is.prod,
        imports: imports(),
        nodePaths: [paladin.scope.repository.branch("node_modules").absolute],
      })).find((output) => output.path === entry).text,
    [mime.tty.solid]: async (entry) =>
      (await esbuild.build({ entryPoints: [entry], bundle: true, format: "esm", platform: "neutral", packages: "external", write: false, plugins: [universal], logLevel: "silent" })).outputFiles[0].text,
    [mime.dom.html]: async (entry) => {
      const html = await paladin.read.text(entry);
      return `const html = ${JSON.stringify(html)};\nexport default (target) => { target.innerHTML = html; return { destroy: () => { target.innerHTML = ""; } }; };`;
    },
  };
  const stems = Object.keys(rows).map(stem);
  const ARTIFACT = new RegExp(`^/?[0-9a-f]{16}\\.(${stems.map((held) => held.replaceAll(".", "\\.")).join("|")})\\.mjs$`);

  paladin.bundler = (directory) => {
    const at = (name) => `${directory}/bundle/${name}`;

    const bundle = async ({ mime: type, source = null, entry = null }) => {
      if (!rows[type]) throw new Error(`bundle: no row for "${type}" — one of ${Object.keys(rows).join(" · ")}`);
      if (source === null && entry === null) throw new Error("bundle: source or entry required");
      const name = stem(type);
      let hash = null;
      let text = null;
      if (source !== null) {
        if (!source.trim()) throw new Error("bundle: source is empty");
        hash = await crypto.digest(source);
        text = await paladin.read.text(at(`${hash.slice(0, 16)}.${name}.mjs`)).catch(missing);
        if (text === null) {
          entry = at(`${hash.slice(0, 16)}.${name}`);
          await paladin.state.text(entry, source);
        }
      }
      if (text === null) {
        text = await rows[type](entry);
        hash ??= await crypto.digest(text);
        await paladin.state.text(at(`${hash.slice(0, 16)}.${name}.mjs`), text);
      }
      return new Bundle({
        entries: [{ mime: type, hash, mount: `/${hash.slice(0, 16)}.${name}.mjs`, integrity: await crypto.digest(text), bytes: text.length }],
      });
    };

    const serve = async (name) => {
      const stem = name.replace(/^\//, "");
      if (!ARTIFACT.test(stem)) return null;
      const text = await paladin.read.text(at(stem)).catch(missing);
      return text === null ? null : { text, type: "text/javascript", integrity: await crypto.digest(text) };
    };

    const inspect = async (hash) => {
      for (const name of stems) {
        const text = await paladin.read.text(at(`${hash.slice(0, 16)}.${name}`)).catch(missing);
        if (text !== null) return { hash: await crypto.digest(text), source: text };
      }
      throw new Error(`bundler.inspect: no source kept for ${hash}`);
    };

    const prune = async ({ dry = false } = {}) => {
      const artifacts = await paladin.find.walk(ARTIFACT)(`${directory}/bundle`, 0).catch(() => []);
      const described = await Promise.all(
        artifacts.map(async (artifact) => {
          const stat = await Deno.stat(artifact.absolute);
          return {
            name: artifact.absolute.slice(`${directory}/bundle/`.length),
            bytes: stat.size,
            mtime: stat.mtime,
            sourced: Boolean(await Deno.stat(artifact.absolute.replace(/\.mjs$/, "")).catch(missing)),
          };
        }),
      );
      const removed = described.filter((held) => !held.sourced).sort((a, b) => b.mtime - a.mtime).slice(1);
      if (!dry) for (const held of removed) await Deno.remove(at(held.name));
      return {
        directory,
        kept: described.length - removed.length,
        removed: removed.map(({ name, bytes }) => ({ name, bytes })),
        bytes: removed.reduce((sum, held) => sum + held.bytes, 0),
      };
    };

    return { directory, bundle, serve, inspect, prune };
  };

  paladin.bundler.under = async (root) => {
    const artifacts = await paladin.find.walk(ARTIFACT)(root).catch(() => []);
    return [...new Set(artifacts.map((artifact) => dirname(dirname(artifact.absolute))))].map(paladin.bundler);
  };
}
