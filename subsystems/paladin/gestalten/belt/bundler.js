import { basename, dirname, join, resolve } from "@std/path";
import * as esbuild from "esbuild";
import { Bundle, bundle as compiler, crypto, mime } from "@vivalence/typology";

const stem = (type) => type.replace(`${mime.VENDOR}.`, "").replace(/\+javascript$/, "");
const missing = (error) => {
  if (error instanceof Deno.errors.NotFound) return null;
  throw error;
};
const VIRTUAL = /^(<[^>]+>|[a-z-]+:(?!file:\/\/))/;
const located = (name) => resolve(name.replace(/^[a-z-]+:file:\/\//, ""));
const stamped = async (path) => {
  const held = await Deno.stat(path);
  return { path, bytes: held.size, mtime: held.mtime.toISOString() };
};
const fresh = async (sources) => {
  if (!sources.length) return false;
  const now = await Promise.all(sources.map((held) => stamped(held.path).catch(missing)));
  return now.every(
    (held, index) => held !== null && held.bytes === sources[index].bytes && held.mtime === sources[index].mtime,
  );
};
const read = (built) => ({ text: built.outputFiles[0].text, read: Object.keys(built.metafile.inputs) });

const solid = (filter, options) => ({
  name: "solid",
  setup(build) {
    build.onLoad({ filter }, async (file) => {
      const [{ transformAsync }, { default: preset }] = await Promise.all([import("@babel/core"), import("babel-preset-solid")]);
      const transformed = await transformAsync(await Deno.readTextFile(file.path), {
        filename: file.path,
        configFile: false,
        babelrc: false,
        presets: [[preset, options]],
      });
      return { contents: transformed.code, loader: "js" };
    });
  },
});
const universal = solid(/\.jsx$/, { generate: "universal", moduleName: "@opentui/solid" });
const dom = solid(/\.(jsx|dom\.solid)$/, { generate: "dom" });

export const MEMBERS = [
  "svelte",
  "svelte/animate",
  "svelte/attachments",
  "svelte/easing",
  "svelte/events",
  "svelte/internal/client",
  "svelte/internal/disclose-version",
  "svelte/internal/flags/async",
  "svelte/internal/flags/legacy",
  "svelte/internal/flags/tracing",
  "svelte/legacy",
  "svelte/motion",
  "svelte/reactivity",
  "svelte/reactivity/window",
  "svelte/store",
  "svelte/transition",
  "solid-js",
  "solid-js/store",
  "solid-js/web",
  "three",
  "@vivalence/dapper",
  "@vivalence/drapes/svelte",
];
const RUNTIME = /^(svelte|solid-js)(\/|$)/;
const member = {
  name: "member",
  setup(build) {
    build.onResolve({ filter: /^[^./]/ }, (args) => {
      if (MEMBERS.includes(args.path)) return { path: args.path, external: true };
      if (!RUNTIME.test(args.path)) return null;
      const text = `[bundler] "${args.path}" is no member — one of ${MEMBERS.join(" · ")}`;
      return { errors: [{ text }] };
    });
  },
};
const ENTRY = /^member:/;
const entries = (directory) => ({
  name: "member entries",
  setup(build) {
    build.onResolve({ filter: ENTRY }, (args) => ({
      path: args.path.replace(ENTRY, ""),
      namespace: "member",
    }));
    build.onLoad({ filter: /.*/, namespace: "member" }, (args) => ({
      contents: `export * from ${JSON.stringify(args.path)};`,
      resolveDir: directory,
      loader: "js",
    }));
  },
});
const flat = (specifier) => specifier.replace(/^@/, "").replaceAll("/", ".");

export default function bundler(paladin) {
  const imports = () => ({
    "@vivalence/typology": paladin.scope.repository.branch("subsystems/typology/mod.client.js").absolute,
    "@vivalence/drapes/": `${paladin.scope.repository.branch("subsystems/drapes").absolute}/`,
  });
  const origins = () => ({
    ...imports(),
    "@vivalence/dapper": paladin.scope.repository.branch("subsystems/dapper/mod.js").absolute,
    "@vivalence/drapes/svelte": paladin.scope.repository.branch("subsystems/drapes/svelte/index.js").absolute,
  });

  const rows = {
    [mime.dom.svelte]: async (entry) => {
      const built = await compiler.svelte(entry, {
        prod: paladin.is.prod,
        imports: imports(),
        nodePaths: [paladin.scope.repository.branch("node_modules").absolute],
        plugins: [member],
      });
      return {
        text: built.outputFiles.find((output) => output.path === entry).text,
        read: Object.keys(built.metafile.inputs),
      };
    },
    [mime.tty.solid]: async (entry) =>
      read(await esbuild.build({
        entryPoints: [entry],
        bundle: true,
        format: "esm",
        platform: "neutral",
        packages: "external",
        write: false,
        metafile: true,
        plugins: [universal],
        logLevel: "silent",
      })),
    [mime.dom.solid]: async (entry) =>
      read(await esbuild.build({
        entryPoints: [entry],
        bundle: true,
        format: "esm",
        platform: "browser",
        nodePaths: [paladin.scope.repository.branch("node_modules").absolute],
        alias: {
          "@vivalence/drapes/solid": paladin.scope.repository.branch("subsystems/drapes/parts.js").absolute,
          "@vivalence/drapes": paladin.scope.repository.branch("subsystems/drapes").absolute,
          "@vivalence/typology": paladin.scope.repository.branch("subsystems/typology/mod.client.js").absolute,
        },
        loader: { ".css": "text" },
        write: false,
        metafile: true,
        plugins: [member, dom],
        logLevel: "silent",
      })),
    [mime.dom.html]: async (entry) => {
      const html = await paladin.read.text(entry);
      return {
        text: `const html = ${JSON.stringify(html)};\nexport default (target) => { target.innerHTML = html; return { destroy: () => { target.innerHTML = ""; } }; };`,
        read: [entry],
      };
    },
  };
  const stems = Object.keys(rows).map(stem);
  const ARTIFACT = new RegExp(`^/?[0-9a-f]{16}\\.(${stems.map((held) => held.replaceAll(".", "\\.")).join("|")})\\.mjs$`);

  paladin.bundler = (directory, origin = null) => {
    const at = (name) => `${directory}/bundle/${name}`;

    const named = async (type, entry, name) => {
      const built = await rows[type](entry);
      const artifact = `${directory}/${name}`;
      await paladin.state.text(artifact, built.text);
      const integrity = await crypto.digest(built.text);
      return {
        bundle: new Bundle({
          entries: [{ mime: type, hash: integrity, mount: `/${name}`, integrity, bytes: built.text.length }],
        }),
        sources: await Promise.all([...built.read.filter((held) => !VIRTUAL.test(held)).map(located), artifact].map(stamped)),
      };
    };

    const bundle = async ({ mime: type, source = null, entry = null, mount = null, name = null }) => {
      if (!rows[type]) throw new Error(`bundle: no row for "${type}" — one of ${Object.keys(rows).join(" · ")}`);
      if (mount !== null) return await named(type, join(origin, mount), name);
      if (source === null && entry === null) throw new Error("bundle: source or entry required");
      const stemmed = stem(type);
      let hash = null;
      let text = null;
      if (source !== null) {
        if (!source.trim()) throw new Error("bundle: source is empty");
        hash = await crypto.digest(source);
        text = await paladin.read.text(at(`${hash.slice(0, 16)}.${stemmed}.mjs`)).catch(missing);
        if (text === null) {
          entry = at(`${hash.slice(0, 16)}.${stemmed}`);
          await paladin.state.text(entry, source);
        }
      }
      if (text === null) {
        text = (await rows[type](entry)).text;
        hash ??= await crypto.digest(text);
        await paladin.state.text(at(`${hash.slice(0, 16)}.${stemmed}.mjs`), text);
      }
      return new Bundle({
        entries: [{ mime: type, hash, mount: `/${hash.slice(0, 16)}.${stemmed}.mjs`, integrity: await crypto.digest(text), bytes: text.length }],
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
            sourced: Boolean(await Deno.stat(artifact.absolute.replace(/\.mjs$/, "")).catch(missing)),
          };
        }),
      );
      const removed = described.filter((held) => !held.sourced);
      if (!dry) for (const held of removed) await Deno.remove(at(held.name));
      return {
        directory,
        kept: described.length - removed.length,
        removed: removed.map(({ name, bytes }) => ({ name, bytes })),
        bytes: removed.reduce((sum, held) => sum + held.bytes, 0),
      };
    };

    return { directory, bundle, fresh, serve, inspect, prune };
  };

  paladin.bundler.members = async () => {
    const built = await compiler.members(
      Object.fromEntries(MEMBERS.map((specifier) => [flat(specifier), `member:${specifier}`])),
      {
        prod: paladin.is.prod,
        imports: origins(),
        nodePaths: [paladin.scope.repository.branch("node_modules").absolute],
        plugins: [entries(paladin.scope.repository.absolute)],
      },
    );
    return {
      imports: Object.fromEntries(
        Object.entries(built.metafile.outputs)
          .filter(([, output]) => output.entryPoint !== undefined)
          .map(([path, output]) => [output.entryPoint.replace(ENTRY, ""), basename(path)]),
      ),
      files: Object.fromEntries(
        built.outputFiles.map((output) => [basename(output.path), output.text]),
      ),
    };
  };

  paladin.bundler.under = async (root) => {
    const artifacts = await paladin.find.walk(ARTIFACT)(root).catch(() => []);
    return [...new Set(artifacts.map((artifact) => dirname(dirname(artifact.absolute))))].map(paladin.bundler);
  };
}
