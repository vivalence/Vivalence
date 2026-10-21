// vite.config.mjs
import solid from "file:///Users/finn/vivalence/code/vivalence/node_modules/.deno/vite-plugin-solid@2.11.10/node_modules/vite-plugin-solid/dist/esm/index.mjs";
import { transformWithEsbuild } from "file:///Users/finn/vivalence/code/vivalence/node_modules/.deno/vite@8.1.0/node_modules/vite/dist/node/index.js";
import { Status } from "@vivalence/typology";
import { dirname, join } from "@std/path";
import { fileURLToPath } from "node:url";
var __vite_injected_original_import_meta_url = "file:///Users/finn/vivalence/code/vivalence/systems/anima/vite.config.mjs";
var __dirname = dirname(fileURLToPath(__vite_injected_original_import_meta_url));
var __repo = join(__dirname, "../../");
var __ss = join(__repo, "./subsystems");
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
        "../ghost/**/*"
      ]
    }
  };
}
var UNKNOWN = { change: "unknown", commit: "unknown", authored: null, built: null };
var TEMPLATE = 'change_id.short(8) ++ " " ++ commit_id.short(8) ++ " " ++ committer.timestamp().format("%+")';
function stamp() {
  const read = (bin, args) => {
    try {
      const { code, stdout } = new Deno.Command(bin, {
        args,
        cwd: __repo,
        stdout: "piped",
        stderr: "null"
      }).outputSync();
      if (code !== 0) return null;
      return new TextDecoder().decode(stdout).trim() || null;
    } catch {
      return null;
    }
  };
  try {
    if (typeof Deno === "undefined") return UNKNOWN;
    const working = Deno.env.get("VIVA_STAMP")?.trim() || read("jj", [
      "log",
      "--no-pager",
      "--ignore-working-copy",
      "--color=never",
      "-r",
      "@",
      "--no-graph",
      "-T",
      TEMPLATE
    ]);
    const built = (/* @__PURE__ */ new Date()).toISOString();
    if (working) {
      const [change, commit, authored] = working.split(" ");
      return { change: change ?? UNKNOWN.change, commit: commit ?? UNKNOWN.commit, authored: authored ?? null, built };
    }
    return {
      change: UNKNOWN.change,
      commit: read("git", ["rev-parse", "--short=8", "HEAD"]) ?? UNKNOWN.commit,
      authored: read("git", ["log", "-1", "--format=%cI"]),
      built
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
    }
  };
}
var bake = () => ({
  name: "paladin:baked",
  resolveId: (id) => id === "paladin:baked" ? id : null,
  async load(id) {
    if (id !== "paladin:baked") return null;
    const { default: paladin, factories, lifecycle } = await import("@vivalence/paladin");
    await factories.instance(paladin.instance);
    await paladin.ledger.registry.supply();
    const { modes, ...data } = await lifecycle.paladin.bake(paladin, "anima");
    return `export default ${JSON.stringify(data)};
export const modes = [${modes.map((citizen) => `{ ...${JSON.stringify(citizen)}, module: () => import(${JSON.stringify(citizen.source)}) }`).join(",")}];`;
  }
});
var jsr = () => {
  const imports = JSON.parse(Deno.readTextFileSync(join(__repo, "import_map.json"))).imports;
  const graphs = /* @__PURE__ */ new Map();
  const bySpecifier = /* @__PURE__ */ new Map();
  const byLocal = /* @__PURE__ */ new Map();
  const redirects = {};
  const graph = (root) => {
    if (!graphs.has(root))
      graphs.set(root, (async () => {
        const { code, stdout, stderr } = await new Deno.Command(Deno.execPath(), {
          args: ["info", "--json", "--config", join(__repo, "deno.jsonc"), root],
          stdout: "piped",
          stderr: "piped"
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
    if (!module?.local) throw new Error(`[jsr] ${specifier}: not in Deno's graph \u2014 deno cache it first`);
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
    }
  };
};
var RESOLVE = /import\.meta\.resolve\((["'])([^"']+)\1\)/g;
var resolving = () => ({
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
    return { code: `${imports.join("\n")}
${out}`, map: null };
  }
});
var vite_config_default = async ({ command }) => ({
  root: join(__dirname, "./src"),
  publicDir: join(__dirname, "./static"),
  plugins: [resolving(), solid(), jsr(), bake(), beacon()],
  logLevel: "info",
  define: {
    __VIVA_BUILD__: JSON.stringify(stamp())
  },
  build: {
    target: "es2022",
    outDir: join(__dirname, "./build"),
    emptyOutDir: true
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
      { find: "@vivalence/drapes", replacement: join(__ss, "./drapes/mod.js") }
    ],
    extensions: [".ts", ".js", ".jsx", ".json", ".svg", ".mjs"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZVJvb3QiOiAiL1VzZXJzL2Zpbm4vdml2YWxlbmNlL2NvZGUvdml2YWxlbmNlL3N5c3RlbXMvYW5pbWEvIiwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvZmlubi92aXZhbGVuY2UvY29kZS92aXZhbGVuY2Uvc3lzdGVtcy9hbmltYVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2Zpbm4vdml2YWxlbmNlL2NvZGUvdml2YWxlbmNlL3N5c3RlbXMvYW5pbWEvdml0ZS5jb25maWcubWpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9maW5uL3ZpdmFsZW5jZS9jb2RlL3ZpdmFsZW5jZS9zeXN0ZW1zL2FuaW1hL3ZpdGUuY29uZmlnLm1qc1wiO2ltcG9ydCBzb2xpZCBmcm9tIFwidml0ZS1wbHVnaW4tc29saWRcIjtcbmltcG9ydCB7IHRyYW5zZm9ybVdpdGhFc2J1aWxkIH0gZnJvbSBcInZpdGVcIjtcbmltcG9ydCB7IFN0YXR1cyB9IGZyb20gXCJAdml2YWxlbmNlL3R5cG9sb2d5XCI7XG5pbXBvcnQgeyBkaXJuYW1lLCBqb2luIH0gZnJvbSBcIkBzdGQvcGF0aFwiO1xuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gXCJub2RlOnVybFwiO1xuY29uc3QgX19kaXJuYW1lID0gZGlybmFtZShmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCkpO1xuY29uc3QgX19yZXBvID0gam9pbihfX2Rpcm5hbWUsIFwiLi4vLi4vXCIpO1xuY29uc3QgX19zcyA9IGpvaW4oX19yZXBvLCBcIi4vc3Vic3lzdGVtc1wiKTtcblxuYXN5bmMgZnVuY3Rpb24gc2VydmVyQ29uZmlnKCkge1xuICBjb25zdCB7IGRlZmF1bHQ6IHBhbGFkaW4sIGZhY3RvcmllcyB9ID0gYXdhaXQgaW1wb3J0KFwiQHZpdmFsZW5jZS9wYWxhZGluXCIpO1xuICBhd2FpdCBmYWN0b3JpZXMuaW5zdGFuY2UocGFsYWRpbi5pbnN0YW5jZSk7XG4gIHBhbGFkaW4uY2hlY2suaW5zdGFuY2UocGFsYWRpbi5pbnN0YW5jZSkudGhyb3coKTtcbiAgY29uc3QgY2xpZW50ID0gcGFsYWRpbi5pbnN0YW5jZS5jbGllbnRzLmZpbmQoKGhlbGQpID0+IGhlbGQubWFuaWZlc3Quc2x1ZyA9PT0gXCJhbmltYVwiKTtcblxuICByZXR1cm4ge1xuICAgIGNvcnM6IHsgb3JpZ2luOiBjbGllbnQuc3RhdGljcy5yZW1vdGU/LmFic29sdXRlIH0sXG4gICAgb3JpZ2luOiBjbGllbnQuc3RhdGljcy5yZW1vdGU/LmFic29sdXRlLFxuXG4gICAgaG9zdDogY2xpZW50LnN0YXRpY3Muc2VydmUuaG9zdG5hbWUsXG4gICAgcG9ydDogcGFyc2VJbnQoY2xpZW50LnN0YXRpY3Muc2VydmUucG9ydCksXG5cbiAgICBzdHJpY3RQb3J0OiB0cnVlLFxuICAgIGZzOiB7IGFsbG93OiBbXCIuL1wiLCBcIi4uLy4uXCIsIFwiLi4vLi4vbm9kZV9tb2R1bGVzXCJdIH0sXG4gICAgd2F0Y2g6IHtcbiAgICAgIHVzZVBvbGxpbmc6IGZhbHNlLFxuICAgICAgaWdub3JlZDogW1wiKiovbm9kZV9tb2R1bGVzLyoqXCIsIFwiKiovIypcIiwgXCIqKi9iYWsvKipcIl0sXG4gICAgICBpbmNsdWRlOiBbXG4gICAgICAgIFwiLi9zcmMvKiovKlwiLFxuICAgICAgICBcIi4uLy4uL2NvbW1vbnMvKiovKi57aHRtbCxqcyxjc3N9XCIsXG4gICAgICAgIFwiLi4vLi4vc3Vic3lzdGVtcy90eXBvbG9neS8qKi8qXCIsXG4gICAgICAgIFwiLi4vLi4vc3Vic3lzdGVtcy9kYXBwZXIvKiovKlwiLFxuICAgICAgICBcIi4uLy4uL3N1YnN5c3RlbXMvZHJhcGVzLyoqLypcIixcbiAgICAgICAgXCIuLi9naG9zdC8qKi8qXCIsXG4gICAgICBdLFxuICAgIH0sXG4gIH07XG59XG5cbmNvbnN0IFVOS05PV04gPSB7IGNoYW5nZTogXCJ1bmtub3duXCIsIGNvbW1pdDogXCJ1bmtub3duXCIsIGF1dGhvcmVkOiBudWxsLCBidWlsdDogbnVsbCB9O1xuXG5jb25zdCBURU1QTEFURSA9XG4gICdjaGFuZ2VfaWQuc2hvcnQoOCkgKysgXCIgXCIgKysgY29tbWl0X2lkLnNob3J0KDgpICsrIFwiIFwiICsrIGNvbW1pdHRlci50aW1lc3RhbXAoKS5mb3JtYXQoXCIlK1wiKSc7XG5cbmZ1bmN0aW9uIHN0YW1wKCkge1xuICBjb25zdCByZWFkID0gKGJpbiwgYXJncykgPT4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB7IGNvZGUsIHN0ZG91dCB9ID0gbmV3IERlbm8uQ29tbWFuZChiaW4sIHtcbiAgICAgICAgYXJncyxcbiAgICAgICAgY3dkOiBfX3JlcG8sXG4gICAgICAgIHN0ZG91dDogXCJwaXBlZFwiLFxuICAgICAgICBzdGRlcnI6IFwibnVsbFwiLFxuICAgICAgfSkub3V0cHV0U3luYygpO1xuICAgICAgaWYgKGNvZGUgIT09IDApIHJldHVybiBudWxsO1xuICAgICAgcmV0dXJuIG5ldyBUZXh0RGVjb2RlcigpLmRlY29kZShzdGRvdXQpLnRyaW0oKSB8fCBudWxsO1xuICAgIH0gY2F0Y2gge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9O1xuICB0cnkge1xuICAgIGlmICh0eXBlb2YgRGVubyA9PT0gXCJ1bmRlZmluZWRcIikgcmV0dXJuIFVOS05PV047XG4gICAgY29uc3Qgd29ya2luZyA9IERlbm8uZW52LmdldChcIlZJVkFfU1RBTVBcIik/LnRyaW0oKSB8fFxuICAgICAgcmVhZChcImpqXCIsIFtcbiAgICAgICAgXCJsb2dcIixcbiAgICAgICAgXCItLW5vLXBhZ2VyXCIsXG4gICAgICAgIFwiLS1pZ25vcmUtd29ya2luZy1jb3B5XCIsXG4gICAgICAgIFwiLS1jb2xvcj1uZXZlclwiLFxuICAgICAgICBcIi1yXCIsXG4gICAgICAgIFwiQFwiLFxuICAgICAgICBcIi0tbm8tZ3JhcGhcIixcbiAgICAgICAgXCItVFwiLFxuICAgICAgICBURU1QTEFURSxcbiAgICAgIF0pO1xuICAgIGNvbnN0IGJ1aWx0ID0gbmV3IERhdGUoKS50b0lTT1N0cmluZygpO1xuICAgIGlmICh3b3JraW5nKSB7XG4gICAgICBjb25zdCBbY2hhbmdlLCBjb21taXQsIGF1dGhvcmVkXSA9IHdvcmtpbmcuc3BsaXQoXCIgXCIpO1xuICAgICAgcmV0dXJuIHsgY2hhbmdlOiBjaGFuZ2UgPz8gVU5LTk9XTi5jaGFuZ2UsIGNvbW1pdDogY29tbWl0ID8/IFVOS05PV04uY29tbWl0LCBhdXRob3JlZDogYXV0aG9yZWQgPz8gbnVsbCwgYnVpbHQgfTtcbiAgICB9XG4gICAgcmV0dXJuIHtcbiAgICAgIGNoYW5nZTogVU5LTk9XTi5jaGFuZ2UsXG4gICAgICBjb21taXQ6IHJlYWQoXCJnaXRcIiwgW1wicmV2LXBhcnNlXCIsIFwiLS1zaG9ydD04XCIsIFwiSEVBRFwiXSkgPz8gVU5LTk9XTi5jb21taXQsXG4gICAgICBhdXRob3JlZDogcmVhZChcImdpdFwiLCBbXCJsb2dcIiwgXCItMVwiLCBcIi0tZm9ybWF0PSVjSVwiXSksXG4gICAgICBidWlsdCxcbiAgICB9O1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gVU5LTk9XTjtcbiAgfVxufVxuXG5mdW5jdGlvbiBiZWFjb24oKSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogXCJ2aXZhLXN0YXR1cy1iZWFjb25cIixcbiAgICBjb25maWd1cmVTZXJ2ZXIoc2VydmVyKSB7XG4gICAgICBzZXJ2ZXIuaHR0cFNlcnZlcj8ub25jZShcImxpc3RlbmluZ1wiLCAoKSA9PiBjb25zb2xlLmxvZyhuZXcgU3RhdHVzKFwicnVubmluZ1wiKSkpO1xuICAgIH0sXG4gIH07XG59XG5cbmNvbnN0IGJha2UgPSAoKSA9PiAoe1xuICBuYW1lOiBcInBhbGFkaW46YmFrZWRcIixcbiAgcmVzb2x2ZUlkOiAoaWQpID0+IChpZCA9PT0gXCJwYWxhZGluOmJha2VkXCIgPyBpZCA6IG51bGwpLFxuICBhc3luYyBsb2FkKGlkKSB7XG4gICAgaWYgKGlkICE9PSBcInBhbGFkaW46YmFrZWRcIikgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgeyBkZWZhdWx0OiBwYWxhZGluLCBmYWN0b3JpZXMsIGxpZmVjeWNsZSB9ID0gYXdhaXQgaW1wb3J0KFwiQHZpdmFsZW5jZS9wYWxhZGluXCIpO1xuICAgIGF3YWl0IGZhY3Rvcmllcy5pbnN0YW5jZShwYWxhZGluLmluc3RhbmNlKTtcbiAgICBhd2FpdCBwYWxhZGluLmxlZGdlci5yZWdpc3RyeS5zdXBwbHkoKTtcbiAgICBjb25zdCB7IG1vZGVzLCAuLi5kYXRhIH0gPSBhd2FpdCBsaWZlY3ljbGUucGFsYWRpbi5iYWtlKHBhbGFkaW4sIFwiYW5pbWFcIik7XG4gICAgcmV0dXJuIGBleHBvcnQgZGVmYXVsdCAke0pTT04uc3RyaW5naWZ5KGRhdGEpfTtcbmV4cG9ydCBjb25zdCBtb2RlcyA9IFske21vZGVzLm1hcCgoY2l0aXplbikgPT4gYHsgLi4uJHtKU09OLnN0cmluZ2lmeShjaXRpemVuKX0sIG1vZHVsZTogKCkgPT4gaW1wb3J0KCR7SlNPTi5zdHJpbmdpZnkoY2l0aXplbi5zb3VyY2UpfSkgfWApLmpvaW4oXCIsXCIpfV07YDtcbiAgfSxcbn0pO1xuXG5jb25zdCBqc3IgPSAoKSA9PiB7XG4gIGNvbnN0IGltcG9ydHMgPSBKU09OLnBhcnNlKERlbm8ucmVhZFRleHRGaWxlU3luYyhqb2luKF9fcmVwbywgXCJpbXBvcnRfbWFwLmpzb25cIikpKS5pbXBvcnRzO1xuICBjb25zdCBncmFwaHMgPSBuZXcgTWFwKCk7XG4gIGNvbnN0IGJ5U3BlY2lmaWVyID0gbmV3IE1hcCgpO1xuICBjb25zdCBieUxvY2FsID0gbmV3IE1hcCgpO1xuICBjb25zdCByZWRpcmVjdHMgPSB7fTtcbiAgY29uc3QgZ3JhcGggPSAocm9vdCkgPT4ge1xuICAgIGlmICghZ3JhcGhzLmhhcyhyb290KSlcbiAgICAgIGdyYXBocy5zZXQocm9vdCwgKGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgeyBjb2RlLCBzdGRvdXQsIHN0ZGVyciB9ID0gYXdhaXQgbmV3IERlbm8uQ29tbWFuZChEZW5vLmV4ZWNQYXRoKCksIHtcbiAgICAgICAgICBhcmdzOiBbXCJpbmZvXCIsIFwiLS1qc29uXCIsIFwiLS1jb25maWdcIiwgam9pbihfX3JlcG8sIFwiZGVuby5qc29uY1wiKSwgcm9vdF0sXG4gICAgICAgICAgc3Rkb3V0OiBcInBpcGVkXCIsXG4gICAgICAgICAgc3RkZXJyOiBcInBpcGVkXCIsXG4gICAgICAgIH0pLm91dHB1dCgpO1xuICAgICAgICBpZiAoY29kZSAhPT0gMCkgdGhyb3cgbmV3IEVycm9yKGBbanNyXSBkZW5vIGluZm8gJHtyb290fTogJHtuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoc3RkZXJyKX1gKTtcbiAgICAgICAgY29uc3QgaGVsZCA9IEpTT04ucGFyc2UobmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKHN0ZG91dCkpO1xuICAgICAgICBPYmplY3QuYXNzaWduKHJlZGlyZWN0cywgaGVsZC5yZWRpcmVjdHMpO1xuICAgICAgICBmb3IgKGNvbnN0IG1vZHVsZSBvZiBoZWxkLm1vZHVsZXMpIHtcbiAgICAgICAgICBieVNwZWNpZmllci5zZXQobW9kdWxlLnNwZWNpZmllciwgbW9kdWxlKTtcbiAgICAgICAgICBpZiAobW9kdWxlLmxvY2FsKSBieUxvY2FsLnNldChtb2R1bGUubG9jYWwsIG1vZHVsZSk7XG4gICAgICAgIH1cbiAgICAgIH0pKCkpO1xuICAgIHJldHVybiBncmFwaHMuZ2V0KHJvb3QpO1xuICB9O1xuICBjb25zdCBsYW5kZWQgPSAoc3BlY2lmaWVyKSA9PiB7XG4gICAgbGV0IGF0ID0gc3BlY2lmaWVyO1xuICAgIHdoaWxlIChyZWRpcmVjdHNbYXRdKSBhdCA9IHJlZGlyZWN0c1thdF07XG4gICAgY29uc3QgbW9kdWxlID0gYnlTcGVjaWZpZXIuZ2V0KGF0KTtcbiAgICBpZiAoIW1vZHVsZT8ubG9jYWwpIHRocm93IG5ldyBFcnJvcihgW2pzcl0gJHtzcGVjaWZpZXJ9OiBub3QgaW4gRGVubydzIGdyYXBoIFx1MjAxNCBkZW5vIGNhY2hlIGl0IGZpcnN0YCk7XG4gICAgcmV0dXJuIG1vZHVsZS5sb2NhbDtcbiAgfTtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiBcImRlbm86anNyXCIsXG4gICAgZW5mb3JjZTogXCJwcmVcIixcbiAgICBhc3luYyByZXNvbHZlSWQoc291cmNlLCBpbXBvcnRlcikge1xuICAgICAgaWYgKGltcG9ydGVyICYmIGJ5TG9jYWwuaGFzKGltcG9ydGVyKSkge1xuICAgICAgICBjb25zdCBkZXBlbmRlbmN5ID0gYnlMb2NhbC5nZXQoaW1wb3J0ZXIpLmRlcGVuZGVuY2llcz8uZmluZCgoaGVsZCkgPT4gaGVsZC5zcGVjaWZpZXIgPT09IHNvdXJjZSk7XG4gICAgICAgIGlmICghZGVwZW5kZW5jeSkgcmV0dXJuIG51bGw7XG4gICAgICAgIGNvbnN0IHRhcmdldCA9IGRlcGVuZGVuY3kuY29kZS5zcGVjaWZpZXI7XG4gICAgICAgIGlmICh0YXJnZXQuc3RhcnRzV2l0aChcImpzcjpcIikgfHwgdGFyZ2V0LnN0YXJ0c1dpdGgoXCJodHRwczpcIikpIGF3YWl0IGdyYXBoKHRhcmdldCk7XG4gICAgICAgIHJldHVybiBsYW5kZWQodGFyZ2V0KTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG1hcHBlZCA9IGltcG9ydHNbc291cmNlXTtcbiAgICAgIGlmICghbWFwcGVkPy5zdGFydHNXaXRoKFwianNyOlwiKSkgcmV0dXJuIG51bGw7XG4gICAgICBhd2FpdCBncmFwaChtYXBwZWQpO1xuICAgICAgcmV0dXJuIGxhbmRlZChtYXBwZWQpO1xuICAgIH0sXG4gICAgYXN5bmMgbG9hZChpZCkge1xuICAgICAgaWYgKCFieUxvY2FsLmhhcyhpZCkpIHJldHVybiBudWxsO1xuICAgICAgY29uc3QgbW9kdWxlID0gYnlMb2NhbC5nZXQoaWQpO1xuICAgICAgcmV0dXJuIHRyYW5zZm9ybVdpdGhFc2J1aWxkKGF3YWl0IERlbm8ucmVhZFRleHRGaWxlKGlkKSwgbmV3IFVSTChtb2R1bGUuc3BlY2lmaWVyKS5wYXRobmFtZSk7XG4gICAgfSxcbiAgfTtcbn07XG5cbmNvbnN0IFJFU09MVkUgPSAvaW1wb3J0XFwubWV0YVxcLnJlc29sdmVcXCgoW1wiJ10pKFteXCInXSspXFwxXFwpL2c7XG5jb25zdCByZXNvbHZpbmcgPSAoKSA9PiAoe1xuICBuYW1lOiBcImltcG9ydC5tZXRhLnJlc29sdmVcIixcbiAgZW5mb3JjZTogXCJwcmVcIixcbiAgYXN5bmMgdHJhbnNmb3JtKGNvZGUsIGlkKSB7XG4gICAgY29uc3QgY2FsbHMgPSBbLi4uY29kZS5tYXRjaEFsbChSRVNPTFZFKV07XG4gICAgaWYgKGNhbGxzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIG51bGw7XG4gICAgY29uc3QgaW1wb3J0cyA9IFtdO1xuICAgIGxldCBvdXQgPSBjb2RlO1xuICAgIGZvciAoY29uc3QgW2luZGV4LCBbY2FsbCwgLCBzcGVjaWZpZXJdXSBvZiBjYWxscy5lbnRyaWVzKCkpIHtcbiAgICAgIGNvbnN0IHJlc29sdmVkID0gYXdhaXQgdGhpcy5yZXNvbHZlKHNwZWNpZmllciwgaWQsIHsgc2tpcFNlbGY6IHRydWUgfSk7XG4gICAgICBpZiAocmVzb2x2ZWQgPT09IG51bGwpIHRocm93IG5ldyBFcnJvcihgW2ltcG9ydC5tZXRhLnJlc29sdmVdICR7c3BlY2lmaWVyfSBmcm9tICR7aWR9OiBub3RoaW5nIHJlc29sdmVzIGl0YCk7XG4gICAgICBpbXBvcnRzLnB1c2goYGltcG9ydCByZXNvbHZlZCQke2luZGV4fSBmcm9tICR7SlNPTi5zdHJpbmdpZnkoYCR7cmVzb2x2ZWQuaWR9P3VybGApfTtgKTtcbiAgICAgIG91dCA9IG91dC5yZXBsYWNlKGNhbGwsIGByZXNvbHZlZCQke2luZGV4fWApO1xuICAgIH1cbiAgICByZXR1cm4geyBjb2RlOiBgJHtpbXBvcnRzLmpvaW4oXCJcXG5cIil9XFxuJHtvdXR9YCwgbWFwOiBudWxsIH07XG4gIH0sXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKHsgY29tbWFuZCB9KSA9PiAoe1xuICByb290OiBqb2luKF9fZGlybmFtZSwgXCIuL3NyY1wiKSxcbiAgcHVibGljRGlyOiBqb2luKF9fZGlybmFtZSwgXCIuL3N0YXRpY1wiKSxcbiAgcGx1Z2luczogW3Jlc29sdmluZygpLCBzb2xpZCgpLCBqc3IoKSwgYmFrZSgpLCBiZWFjb24oKV0sXG4gIGxvZ0xldmVsOiBcImluZm9cIixcbiAgZGVmaW5lOiB7XG4gICAgX19WSVZBX0JVSUxEX186IEpTT04uc3RyaW5naWZ5KHN0YW1wKCkpLFxuICB9LFxuICBidWlsZDoge1xuICAgIHRhcmdldDogXCJlczIwMjJcIixcbiAgICBvdXREaXI6IGpvaW4oX19kaXJuYW1lLCBcIi4vYnVpbGRcIiksXG4gICAgZW1wdHlPdXREaXI6IHRydWUsXG4gIH0sXG4gIGNzczogeyBwb3N0Y3NzOiB7fSB9LFxuICBzZXJ2ZXI6IGNvbW1hbmQgPT09IFwic2VydmVcIiA/IGF3YWl0IHNlcnZlckNvbmZpZygpIDoge30sXG4gIHByZXZpZXc6IGNvbW1hbmQgPT09IFwic2VydmVcIiA/IGF3YWl0IHNlcnZlckNvbmZpZygpIDoge30sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczogW1xuICAgICAgeyBmaW5kOiBcIkB2aXZhbGVuY2UvcGFsYWRpblwiLCByZXBsYWNlbWVudDogam9pbihfX3NzLCBcIi4vcGFsYWRpbi9tb2QuY2xpZW50LmpzXCIpIH0sXG4gICAgICB7IGZpbmQ6IFwiQHZpdmFsZW5jZS9naG9zdFwiLCByZXBsYWNlbWVudDogam9pbihfX3JlcG8sIFwiLi9zeXN0ZW1zL2dob3N0L3R5cG9sb2d5LmpzXCIpIH0sXG5cbiAgICAgIHsgZmluZDogXCJAdml2YWxlbmNlL3R5cG9sb2d5L3NjaGVtYXRpY3NcIiwgcmVwbGFjZW1lbnQ6IGpvaW4oX19zcywgXCIuL3R5cG9sb2d5L3NjaGVtYXRpY3MvaW5kZXguanNcIikgfSxcbiAgICAgIHsgZmluZDogXCJAdml2YWxlbmNlL3R5cG9sb2d5XCIsIHJlcGxhY2VtZW50OiBqb2luKF9fc3MsIFwiLi90eXBvbG9neS9tb2QuY2xpZW50LmpzXCIpIH0sXG5cbiAgICAgIHsgZmluZDogXCJAdml2YWxlbmNlL2RhcHBlci9mb250LmNzc1wiLCByZXBsYWNlbWVudDogam9pbihfX3NzLCBcIi4vZGFwcGVyL3ByaW1pdGl2ZXMvZm9udC5jc3NcIikgfSxcbiAgICAgIHsgZmluZDogXCJAdml2YWxlbmNlL2RhcHBlci9ic3AuY3NzXCIsIHJlcGxhY2VtZW50OiBqb2luKF9fc3MsIFwiLi9kYXBwZXIvcHJpbWl0aXZlcy9ic3AuY3NzXCIpIH0sXG4gICAgICB7IGZpbmQ6IFwiQHZpdmFsZW5jZS9kYXBwZXIvY29udHJhc3RcIiwgcmVwbGFjZW1lbnQ6IGpvaW4oX19zcywgXCIuL2RhcHBlci9saWIvY29udHJhc3QuanNcIikgfSxcbiAgICAgIHsgZmluZDogXCJAdml2YWxlbmNlL2RhcHBlci9hc3NldHNcIiwgcmVwbGFjZW1lbnQ6IGpvaW4oX19zcywgXCIuL2RhcHBlci9hc3NldHNcIikgfSxcbiAgICAgIHsgZmluZDogXCJAdml2YWxlbmNlL2RhcHBlclwiLCByZXBsYWNlbWVudDogam9pbihfX3NzLCBcIi4vZGFwcGVyL21vZC5qc1wiKSB9LFxuICAgICAgeyBmaW5kOiBcIkB2aXZhbGVuY2UvZHJhcGVzL3BhcnRzLmNzc1wiLCByZXBsYWNlbWVudDogam9pbihfX3NzLCBcIi4vZHJhcGVzL3BhcnRzLmNzc1wiKSB9LFxuICAgICAgeyBmaW5kOiBcIkB2aXZhbGVuY2UvZHJhcGVzL3BhcnRzXCIsIHJlcGxhY2VtZW50OiBqb2luKF9fc3MsIFwiLi9kcmFwZXMvcGFydHMuanNcIikgfSxcbiAgICAgIHsgZmluZDogXCJAdml2YWxlbmNlL2RyYXBlc1wiLCByZXBsYWNlbWVudDogam9pbihfX3NzLCBcIi4vZHJhcGVzL21vZC5qc1wiKSB9LFxuICAgIF0sXG4gICAgZXh0ZW5zaW9uczogW1wiLnRzXCIsIFwiLmpzXCIsIFwiLmpzeFwiLCBcIi5qc29uXCIsIFwiLnN2Z1wiLCBcIi5tanNcIl0sXG4gIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBMFUsT0FBTyxXQUFXO0FBQzVWLFNBQVMsNEJBQTRCO0FBQ3JDLFNBQVMsY0FBYztBQUN2QixTQUFTLFNBQVMsWUFBWTtBQUM5QixTQUFTLHFCQUFxQjtBQUorSyxJQUFNLDJDQUEyQztBQUs5UCxJQUFNLFlBQVksUUFBUSxjQUFjLHdDQUFlLENBQUM7QUFDeEQsSUFBTSxTQUFTLEtBQUssV0FBVyxRQUFRO0FBQ3ZDLElBQU0sT0FBTyxLQUFLLFFBQVEsY0FBYztBQUV4QyxlQUFlLGVBQWU7QUFDNUIsUUFBTSxFQUFFLFNBQVMsU0FBUyxVQUFVLElBQUksTUFBTSxPQUFPLG9CQUFvQjtBQUN6RSxRQUFNLFVBQVUsU0FBUyxRQUFRLFFBQVE7QUFDekMsVUFBUSxNQUFNLFNBQVMsUUFBUSxRQUFRLEVBQUUsTUFBTTtBQUMvQyxRQUFNLFNBQVMsUUFBUSxTQUFTLFFBQVEsS0FBSyxDQUFDLFNBQVMsS0FBSyxTQUFTLFNBQVMsT0FBTztBQUVyRixTQUFPO0FBQUEsSUFDTCxNQUFNLEVBQUUsUUFBUSxPQUFPLFFBQVEsUUFBUSxTQUFTO0FBQUEsSUFDaEQsUUFBUSxPQUFPLFFBQVEsUUFBUTtBQUFBLElBRS9CLE1BQU0sT0FBTyxRQUFRLE1BQU07QUFBQSxJQUMzQixNQUFNLFNBQVMsT0FBTyxRQUFRLE1BQU0sSUFBSTtBQUFBLElBRXhDLFlBQVk7QUFBQSxJQUNaLElBQUksRUFBRSxPQUFPLENBQUMsTUFBTSxTQUFTLG9CQUFvQixFQUFFO0FBQUEsSUFDbkQsT0FBTztBQUFBLE1BQ0wsWUFBWTtBQUFBLE1BQ1osU0FBUyxDQUFDLHNCQUFzQixTQUFTLFdBQVc7QUFBQSxNQUNwRCxTQUFTO0FBQUEsUUFDUDtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEsUUFDQTtBQUFBLFFBQ0E7QUFBQSxRQUNBO0FBQUEs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
