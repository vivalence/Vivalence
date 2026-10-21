import solid from "vite-plugin-solid";
import { transformWithEsbuild } from "vite";
import { Status } from "@vivalence/typology";
import { dirname, join } from "@std/path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));
const __repo = join(__dirname, "../../");
const __ss = join(__repo, "./subsystems");

async function serverConfig() {
  const { default: paladin, factories } = await import("@vivalence/paladin");
  await factories.instance(paladin.instance);
  paladin.check.instance(paladin.instance).throw();
  const client = paladin.instance.clients.find((held) => held.manifest.slug === "anima");

  return {
    cors: { origin: client.statics.remote?.absolute },
    origin: client.statics.remote?.absolute,

    host: client.statics.serve.hostname,
    port: parseInt(client.statics.serve.port),

    strictPort: true,
    fs: { allow: ["./", "../..", "../../node_modules"] },
    watch: {
      usePolling: false,
      ignored: ["**/node_modules/**", "**/#*", "**/bak/**"],
      include: [
        "./src/**/*",
        "../../commons/**/*.{html,js,css}",
        "../../subsystems/typology/**/*",
        "../../subsystems/dapper/**/*",
        "../../subsystems/drapes/**/*",
        "../ghost/**/*",
      ],
    },
  };
}

const UNKNOWN = { change: "unknown", commit: "unknown", authored: null, built: null };

const TEMPLATE =
  'change_id.short(8) ++ " " ++ commit_id.short(8) ++ " " ++ committer.timestamp().format("%+")';

function stamp() {
  const read = (bin, args) => {
    try {
      const { code, stdout } = new Deno.Command(bin, {
        args,
        cwd: __repo,
        stdout: "piped",
        stderr: "null",
      }).outputSync();
      if (code !== 0) return null;
      return new TextDecoder().decode(stdout).trim() || null;
    } catch {
      return null;
    }
  };
  try {
    if (typeof Deno === "undefined") return UNKNOWN;
    const working = Deno.env.get("VIVA_STAMP")?.trim() ||
      read("jj", [
        "log",
        "--no-pager",
        "--ignore-working-copy",
        "--color=never",
        "-r",
        "@",
        "--no-graph",
        "-T",
        TEMPLATE,
      ]);
    const built = new Date().toISOString();
    if (working) {
      const [change, commit, authored] = working.split(" ");
      return { change: change ?? UNKNOWN.change, commit: commit ?? UNKNOWN.commit, authored: authored ?? null, built };
    }
    return {
      change: UNKNOWN.change,
      commit: read("git", ["rev-parse", "--short=8", "HEAD"]) ?? UNKNOWN.commit,
      authored: read("git", ["log", "-1", "--format=%cI"]),
      built,
    };
  } catch {
    return UNKNOWN;
  }
}

function beacon() {
  return {
    name: "viva-status-beacon",
    configureServer(server) {
      server.httpServer?.once("listening", () => console.log(new Status("running")));
    },
  };
}

const bake = () => ({
  name: "paladin:baked",
  resolveId: (id) => (id === "paladin:baked" ? id : null),
  async load(id) {
    if (id !== "paladin:baked") return null;
    const { default: paladin, factories, lifecycle } = await import("@vivalence/paladin");
    await factories.instance(paladin.instance);
    await paladin.ledger.registry.supply();
    const { modes, ...data } = await lifecycle.paladin.bake(paladin, "anima");
    return `export default ${JSON.stringify(data)};
export const modes = [${modes.map((citizen) => `{ ...${JSON.stringify(citizen)}, module: () => import(${JSON.stringify(citizen.source)}) }`).join(",")}];`;
  },
});

const jsr = () => {
  const imports = JSON.parse(Deno.readTextFileSync(join(__repo, "import_map.json"))).imports;
  const graphs = new Map();
  const bySpecifier = new Map();
  const byLocal = new Map();
  const redirects = {};
  const graph = (root) => {
    if (!graphs.has(root))
      graphs.set(root, (async () => {
        const { code, stdout, stderr } = await new Deno.Command(Deno.execPath(), {
          args: ["info", "--json", "--config", join(__repo, "deno.jsonc"), root],
          stdout: "piped",
          stderr: "piped",
        }).output();
        if (code !== 0) throw new Error(`[jsr] deno info ${root}: ${new TextDecoder().decode(stderr)}`);
        const held = JSON.parse(new TextDecoder().decode(stdout));
        Object.assign(redirects, held.redirects);
        for (const module of held.modules) {
          bySpecifier.set(module.specifier, module);
          if (module.local) byLocal.set(module.local, module);
        }
      })());
    return graphs.get(root);
  };
  const landed = (specifier) => {
    let at = specifier;
    while (redirects[at]) at = redirects[at];
    const module = bySpecifier.get(at);
    if (!module?.local) throw new Error(`[jsr] ${specifier}: not in Deno's graph — deno cache it first`);
    return module.local;
  };
  return {
    name: "deno:jsr",
    enforce: "pre",
    async resolveId(source, importer) {
      if (importer && byLocal.has(importer)) {
        const dependency = byLocal.get(importer).dependencies?.find((held) => held.specifier === source);
        if (!dependency) return null;
        const target = dependency.code.specifier;
        if (target.startsWith("jsr:") || target.startsWith("https:")) await graph(target);
        return landed(target);
      }
      const mapped = imports[source];
      if (!mapped?.startsWith("jsr:")) return null;
      await graph(mapped);
      return landed(mapped);
    },
    async load(id) {
      if (!byLocal.has(id)) return null;
      const module = byLocal.get(id);
      return transformWithEsbuild(await Deno.readTextFile(id), new URL(module.specifier).pathname);
    },
  };
};

const RESOLVE = /import\.meta\.resolve\((["'])([^"']+)\1\)/g;
const resolving = () => ({
  name: "import.meta.resolve",
  enforce: "pre",
  async transform(code, id) {
    const calls = [...code.matchAll(RESOLVE)];
    if (calls.length === 0) return null;
    const imports = [];
    let out = code;
    for (const [index, [call, , specifier]] of calls.entries()) {
      const resolved = await this.resolve(specifier, id, { skipSelf: true });
      if (resolved === null) throw new Error(`[import.meta.resolve] ${specifier} from ${id}: nothing resolves it`);
      imports.push(`import resolved$${index} from ${JSON.stringify(`${resolved.id}?url`)};`);
      out = out.replace(call, `resolved$${index}`);
    }
    return { code: `${imports.join("\n")}\n${out}`, map: null };
  },
});

export default async ({ command }) => ({
  root: join(__dirname, "./src"),
  publicDir: join(__dirname, "./static"),
  plugins: [resolving(), solid(), jsr(), bake(), beacon()],
  logLevel: "info",
  define: {
    __VIVA_BUILD__: JSON.stringify(stamp()),
  },
  build: {
    target: "es2022",
    outDir: join(__dirname, "./build"),
    emptyOutDir: true,
  },
  css: { postcss: {} },
  server: command === "serve" ? await serverConfig() : {},
  preview: command === "serve" ? await serverConfig() : {},
  resolve: {
    alias: [
      { find: "@vivalence/paladin", replacement: join(__ss, "./paladin/mod.client.js") },
      { find: "@vivalence/ghost", replacement: join(__repo, "./systems/ghost/typology.js") },

      { find: "@vivalence/typology/schematics", replacement: join(__ss, "./typology/schematics/index.js") },
      { find: "@vivalence/typology", replacement: join(__ss, "./typology/mod.client.js") },

      { find: "@vivalence/dapper/font.css", replacement: join(__ss, "./dapper/primitives/font.css") },
      { find: "@vivalence/dapper/bsp.css", replacement: join(__ss, "./dapper/primitives/bsp.css") },
      { find: "@vivalence/dapper/contrast", replacement: join(__ss, "./dapper/lib/contrast.js") },
      { find: "@vivalence/dapper/assets", replacement: join(__ss, "./dapper/assets") },
      { find: "@vivalence/dapper", replacement: join(__ss, "./dapper/mod.js") },
      { find: "@vivalence/drapes/parts.css", replacement: join(__ss, "./drapes/parts.css") },
      { find: "@vivalence/drapes/parts", replacement: join(__ss, "./drapes/parts.js") },
      { find: "@vivalence/drapes", replacement: join(__ss, "./drapes/mod.js") },
    ],
    extensions: [".ts", ".js", ".jsx", ".json", ".svg", ".mjs"],
  },
});
