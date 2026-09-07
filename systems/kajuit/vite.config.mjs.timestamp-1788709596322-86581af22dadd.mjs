// vite.config.mjs
import deno from "file:///Users/finn/vivalence/code/vivalence/node_modules/.deno/@deno+vite-plugin@1.0.6/node_modules/@deno/vite-plugin/dist/index.js";
import { Url, Status } from "@vivalence/typology";
import { sveltekit } from "file:///Users/finn/vivalence/code/vivalence/node_modules/.deno/@sveltejs+kit@2.43.8/node_modules/@sveltejs/kit/src/exports/vite/index.js";
import { dirname, join } from "@std/path";
import { fileURLToPath } from "node:url";
var __vite_injected_original_import_meta_url = "file:///Users/finn/vivalence/code/vivalence/systems/kajuit/vite.config.mjs";
var __dirname = dirname(fileURLToPath(__vite_injected_original_import_meta_url));
var __repo = join(__dirname, "../../");
var __ss = join(__repo, "./subsystems");
async function serverConfig() {
  const paladin = (await import("@vivalence/paladin")).default;
  await paladin.instance.mount();
  paladin.check.instance(paladin.instance).throw();
  const client = paladin.instance.clients.kajuit;
  return {
    cors: { origin: client.statics.remote?.absolute },
    origin: client.statics.remote?.absolute,
    // allowedHosts,
    host: client.statics.serve.hostname,
    port: parseInt(client.statics.serve.port),
    strictPort: true,
    fs: { allow: ["./", "../..", "../../node_modules"] },
    watch: {
      usePolling: false,
      ignored: ["**/node_modules/**", "**/#*", "**/bak/**"],
      include: [
        "./src/**/*",
        "../../commons/**/*.{html,svelte,js,css}",
        "../../subsystems/typology/**/*",
        "../../subsystems/dapper/**/*",
        "../../subsystems/drapes/**/*"
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
      server.httpServer?.once("listening", () => console.log(new Status("alive")));
    }
  };
}
var vite_config_default = async ({ command }) => ({
  plugins: [sveltekit(), deno(), beacon()],
  logLevel: "info",
  define: {
    __VIVA_BUILD__: JSON.stringify(stamp())
  },
  build: {
    target: "es2022"
  },
  server: command === "serve" ? await serverConfig() : {},
  preview: command === "serve" ? await serverConfig() : {},
  ssr: {
    noExternal: true
  },
  resolve: {
    alias: {
      // STABLE
      $telemetry: join(__dirname, "./src/telemetry/index.js"),
      $client: join(__dirname, "./src/client.js"),
      "@vivalence/kajuit": join(__dirname, "./src/typology/mod.js"),
      "@vivalence/typology": join(__ss, "./typology/mod.client.js"),
      "@vivalence/typology/schematics": join(__ss, "./typology/schematics/index.js"),
      "@vivalence/dapper/font.css": join(__repo, "./subsystems/dapper/primitives/font.css"),
      "@vivalence/dapper/bsp.css": join(__repo, "./subsystems/dapper/primitives/bsp.css"),
      "@vivalence/dapper": join(__repo, "./subsystems/dapper/mod.js"),
      // ? needed ?
      "@vivalence/drapes": join(__repo, "./subsystems/drapes/mod.js")
      // ? needed ?
      // TBD
      // # "@client/shadcn/": join(__dirname, "./src/components/shadcn/"),
      // # "@assets/": env.get("VIVA_ASSETS_DIR") || join(env.get("VIVA_CONFIG_DIR"), "./assets/"), // i want to access to $viva_config_dir/assets present as @client/assets
      // "@static/icons/": join(__dirname, "./static/icons/"),
      // "$static/images/": join(__dirname, "./static/images/"),
    },
    extensions: [".ts", ".js", ".jsx", ".json", ".svelte", ".svg", ".mjs"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubWpzIl0sCiAgInNvdXJjZVJvb3QiOiAiL1VzZXJzL2Zpbm4vdml2YWxlbmNlL2NvZGUvdml2YWxlbmNlL3N5c3RlbXMva2FqdWl0LyIsCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL1VzZXJzL2Zpbm4vdml2YWxlbmNlL2NvZGUvdml2YWxlbmNlL3N5c3RlbXMva2FqdWl0XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvZmlubi92aXZhbGVuY2UvY29kZS92aXZhbGVuY2Uvc3lzdGVtcy9rYWp1aXQvdml0ZS5jb25maWcubWpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9maW5uL3ZpdmFsZW5jZS9jb2RlL3ZpdmFsZW5jZS9zeXN0ZW1zL2thanVpdC92aXRlLmNvbmZpZy5tanNcIjtpbXBvcnQgZGVubyBmcm9tIFwiQGRlbm8vdml0ZS1wbHVnaW5cIjtcbmltcG9ydCB7IFVybCwgU3RhdHVzIH0gZnJvbSBcIkB2aXZhbGVuY2UvdHlwb2xvZ3lcIjtcbmltcG9ydCB7IHN2ZWx0ZWtpdCB9IGZyb20gXCJAc3ZlbHRlanMva2l0L3ZpdGVcIjtcbmltcG9ydCB7IGRpcm5hbWUsIGpvaW4gfSBmcm9tIFwiQHN0ZC9wYXRoXCI7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSBcIm5vZGU6dXJsXCI7XG5jb25zdCBfX2Rpcm5hbWUgPSBkaXJuYW1lKGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKSk7XG5jb25zdCBfX3JlcG8gPSBqb2luKF9fZGlybmFtZSwgXCIuLi8uLi9cIik7XG5jb25zdCBfX3NzID0gam9pbihfX3JlcG8sIFwiLi9zdWJzeXN0ZW1zXCIpO1xuXG5hc3luYyBmdW5jdGlvbiBzZXJ2ZXJDb25maWcoKSB7XG4gIGNvbnN0IHBhbGFkaW4gPSAoYXdhaXQgaW1wb3J0KFwiQHZpdmFsZW5jZS9wYWxhZGluXCIpKS5kZWZhdWx0O1xuICBhd2FpdCBwYWxhZGluLmluc3RhbmNlLm1vdW50KCk7XG4gIHBhbGFkaW4uY2hlY2suaW5zdGFuY2UocGFsYWRpbi5pbnN0YW5jZSkudGhyb3coKTtcbiAgY29uc3QgY2xpZW50ID0gcGFsYWRpbi5pbnN0YW5jZS5jbGllbnRzLmthanVpdDtcbiAgLy8gY29uc29sZS5sb2coXCJwYWxhZGluLmVudlwiLCBwYWxhZGluLmVudik7XG4gIC8vIGNvbnN0IGNsaWVudCA9IHtzbHVnOiBcImthanVpdFwiLCBtb2R1bGU6IFwiQHZpdmFsZW5jZS9rYWp1aXRcIiwgc3RhdGljczoge3NlcnZlOiBuZXcgVXJsKFwiaHR0cDovLzAuMC4wLjA6MTc5NFwiKSwgbGlnaHRob3VzZToge3JlbW90ZTogbmV3IFVybChcImh0dHA6Ly8xMDAuNzEuMjQxLjE2MDoyNTAxL2F0dGFjaGVkL3Byb2Nlc3MvbGlnaHRob3VzZS9tdWx0aXBsYXllclwiKSx9LH0sfTtcbiAgLy8gY29uc29sZS5sb2coeyBjbGllbnQgfSk7XG5cbiAgLy8gbGV0IGFsbG93ZWRIb3N0cyA9IHBhbGFkaW4uaXMuZGV2O1xuICAvLyBpZiAoY2xpZW50LnN0YXRpY3MucmVtb3RlKSBhbGxvd2VkSG9zdHMgPSBbY2xpZW50LnN0YXRpY3MucmVtb3RlLmhvc3RuYW1lXTtcbiAgLy8gaWYgKHBhbGFkaW4uZW52LmhhcyhcIlZJVkFfQ0xJRU5UX0tBSlVJVF9BTExPV0VESE9TVFNcIikpIGFsbG93ZWRIb3N0cyA9IFtwYWxhZGluLmVudi5nZXQoXCJWSVZBX0NMSUVOVF9LQUpVSVRfQUxMT1dFREhPU1RTXCIpXTtcblxuICByZXR1cm4ge1xuICAgIGNvcnM6IHsgb3JpZ2luOiBjbGllbnQuc3RhdGljcy5yZW1vdGU/LmFic29sdXRlIH0sXG4gICAgb3JpZ2luOiBjbGllbnQuc3RhdGljcy5yZW1vdGU/LmFic29sdXRlLFxuICAgIC8vIGFsbG93ZWRIb3N0cyxcblxuICAgIGhvc3Q6IGNsaWVudC5zdGF0aWNzLnNlcnZlLmhvc3RuYW1lLFxuICAgIHBvcnQ6IHBhcnNlSW50KGNsaWVudC5zdGF0aWNzLnNlcnZlLnBvcnQpLFxuXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgICBmczogeyBhbGxvdzogW1wiLi9cIiwgXCIuLi8uLlwiLCBcIi4uLy4uL25vZGVfbW9kdWxlc1wiXSB9LFxuICAgIHdhdGNoOiB7XG4gICAgICB1c2VQb2xsaW5nOiBmYWxzZSxcbiAgICAgIGlnbm9yZWQ6IFtcIioqL25vZGVfbW9kdWxlcy8qKlwiLCBcIioqLyMqXCIsIFwiKiovYmFrLyoqXCJdLFxuICAgICAgaW5jbHVkZTogW1xuICAgICAgICBcIi4vc3JjLyoqLypcIixcbiAgICAgICAgXCIuLi8uLi9jb21tb25zLyoqLyoue2h0bWwsc3ZlbHRlLGpzLGNzc31cIixcbiAgICAgICAgXCIuLi8uLi9zdWJzeXN0ZW1zL3R5cG9sb2d5LyoqLypcIixcbiAgICAgICAgXCIuLi8uLi9zdWJzeXN0ZW1zL2RhcHBlci8qKi8qXCIsXG4gICAgICAgIFwiLi4vLi4vc3Vic3lzdGVtcy9kcmFwZXMvKiovKlwiLFxuICAgICAgXSxcbiAgICB9LFxuICB9O1xufVxuXG5jb25zdCBVTktOT1dOID0geyBjaGFuZ2U6IFwidW5rbm93blwiLCBjb21taXQ6IFwidW5rbm93blwiLCBhdXRob3JlZDogbnVsbCwgYnVpbHQ6IG51bGwgfTtcblxuY29uc3QgVEVNUExBVEUgPVxuICAnY2hhbmdlX2lkLnNob3J0KDgpICsrIFwiIFwiICsrIGNvbW1pdF9pZC5zaG9ydCg4KSArKyBcIiBcIiArKyBjb21taXR0ZXIudGltZXN0YW1wKCkuZm9ybWF0KFwiJStcIiknO1xuXG5mdW5jdGlvbiBzdGFtcCgpIHtcbiAgY29uc3QgcmVhZCA9IChiaW4sIGFyZ3MpID0+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgeyBjb2RlLCBzdGRvdXQgfSA9IG5ldyBEZW5vLkNvbW1hbmQoYmluLCB7XG4gICAgICAgIGFyZ3MsXG4gICAgICAgIGN3ZDogX19yZXBvLFxuICAgICAgICBzdGRvdXQ6IFwicGlwZWRcIixcbiAgICAgICAgc3RkZXJyOiBcIm51bGxcIixcbiAgICAgIH0pLm91dHB1dFN5bmMoKTtcbiAgICAgIGlmIChjb2RlICE9PSAwKSByZXR1cm4gbnVsbDtcbiAgICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoc3Rkb3V0KS50cmltKCkgfHwgbnVsbDtcbiAgICB9IGNhdGNoIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfTtcbiAgdHJ5IHtcbiAgICBpZiAodHlwZW9mIERlbm8gPT09IFwidW5kZWZpbmVkXCIpIHJldHVybiBVTktOT1dOO1xuICAgIGNvbnN0IHdvcmtpbmcgPSBEZW5vLmVudi5nZXQoXCJWSVZBX1NUQU1QXCIpPy50cmltKCkgfHxcbiAgICAgIHJlYWQoXCJqalwiLCBbXG4gICAgICAgIFwibG9nXCIsXG4gICAgICAgIFwiLS1uby1wYWdlclwiLFxuICAgICAgICBcIi0taWdub3JlLXdvcmtpbmctY29weVwiLFxuICAgICAgICBcIi0tY29sb3I9bmV2ZXJcIixcbiAgICAgICAgXCItclwiLFxuICAgICAgICBcIkBcIixcbiAgICAgICAgXCItLW5vLWdyYXBoXCIsXG4gICAgICAgIFwiLVRcIixcbiAgICAgICAgVEVNUExBVEUsXG4gICAgICBdKTtcbiAgICBjb25zdCBidWlsdCA9IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbiAgICBpZiAod29ya2luZykge1xuICAgICAgY29uc3QgW2NoYW5nZSwgY29tbWl0LCBhdXRob3JlZF0gPSB3b3JraW5nLnNwbGl0KFwiIFwiKTtcbiAgICAgIHJldHVybiB7IGNoYW5nZTogY2hhbmdlID8/IFVOS05PV04uY2hhbmdlLCBjb21taXQ6IGNvbW1pdCA/PyBVTktOT1dOLmNvbW1pdCwgYXV0aG9yZWQ6IGF1dGhvcmVkID8/IG51bGwsIGJ1aWx0IH07XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICBjaGFuZ2U6IFVOS05PV04uY2hhbmdlLFxuICAgICAgY29tbWl0OiByZWFkKFwiZ2l0XCIsIFtcInJldi1wYXJzZVwiLCBcIi0tc2hvcnQ9OFwiLCBcIkhFQURcIl0pID8/IFVOS05PV04uY29tbWl0LFxuICAgICAgYXV0aG9yZWQ6IHJlYWQoXCJnaXRcIiwgW1wibG9nXCIsIFwiLTFcIiwgXCItLWZvcm1hdD0lY0lcIl0pLFxuICAgICAgYnVpbHQsXG4gICAgfTtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIFVOS05PV047XG4gIH1cbn1cblxuZnVuY3Rpb24gYmVhY29uKCkge1xuICByZXR1cm4ge1xuICAgIG5hbWU6IFwidml2YS1zdGF0dXMtYmVhY29uXCIsXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgc2VydmVyLmh0dHBTZXJ2ZXI/Lm9uY2UoXCJsaXN0ZW5pbmdcIiwgKCkgPT4gY29uc29sZS5sb2cobmV3IFN0YXR1cyhcImFsaXZlXCIpKSk7XG4gICAgfSxcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgYXN5bmMgKHsgY29tbWFuZCB9KSA9PiAoe1xuICBwbHVnaW5zOiBbc3ZlbHRla2l0KCksIGRlbm8oKSwgYmVhY29uKCldLFxuICBsb2dMZXZlbDogXCJpbmZvXCIsXG4gIGRlZmluZToge1xuICAgIF9fVklWQV9CVUlMRF9fOiBKU09OLnN0cmluZ2lmeShzdGFtcCgpKSxcbiAgfSxcbiAgYnVpbGQ6IHtcbiAgICB0YXJnZXQ6IFwiZXMyMDIyXCIsXG4gIH0sXG4gIHNlcnZlcjogY29tbWFuZCA9PT0gXCJzZXJ2ZVwiID8gYXdhaXQgc2VydmVyQ29uZmlnKCkgOiB7fSxcbiAgcHJldmlldzogY29tbWFuZCA9PT0gXCJzZXJ2ZVwiID8gYXdhaXQgc2VydmVyQ29uZmlnKCkgOiB7fSxcbiAgc3NyOiB7XG4gICAgbm9FeHRlcm5hbDogdHJ1ZSxcbiAgfSxcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiB7XG4gICAgICAvLyBTVEFCTEVcbiAgICAgICR0ZWxlbWV0cnk6IGpvaW4oX19kaXJuYW1lLCBcIi4vc3JjL3RlbGVtZXRyeS9pbmRleC5qc1wiKSxcbiAgICAgICRjbGllbnQ6IGpvaW4oX19kaXJuYW1lLCBcIi4vc3JjL2NsaWVudC5qc1wiKSxcbiAgICAgIFwiQHZpdmFsZW5jZS9rYWp1aXRcIjogam9pbihfX2Rpcm5hbWUsIFwiLi9zcmMvdHlwb2xvZ3kvbW9kLmpzXCIpLFxuXG4gICAgICBcIkB2aXZhbGVuY2UvdHlwb2xvZ3lcIjogam9pbihfX3NzLCBcIi4vdHlwb2xvZ3kvbW9kLmNsaWVudC5qc1wiKSxcbiAgICAgIFwiQHZpdmFsZW5jZS90eXBvbG9neS9zY2hlbWF0aWNzXCI6IGpvaW4oX19zcywgXCIuL3R5cG9sb2d5L3NjaGVtYXRpY3MvaW5kZXguanNcIiksXG5cbiAgICAgIFwiQHZpdmFsZW5jZS9kYXBwZXIvZm9udC5jc3NcIjogam9pbihfX3JlcG8sIFwiLi9zdWJzeXN0ZW1zL2RhcHBlci9wcmltaXRpdmVzL2ZvbnQuY3NzXCIpLFxuICAgICAgXCJAdml2YWxlbmNlL2RhcHBlci9ic3AuY3NzXCI6IGpvaW4oX19yZXBvLCBcIi4vc3Vic3lzdGVtcy9kYXBwZXIvcHJpbWl0aXZlcy9ic3AuY3NzXCIpLFxuXG4gICAgICBcIkB2aXZhbGVuY2UvZGFwcGVyXCI6IGpvaW4oX19yZXBvLCBcIi4vc3Vic3lzdGVtcy9kYXBwZXIvbW9kLmpzXCIpLCAvLyA/IG5lZWRlZCA/XG4gICAgICBcIkB2aXZhbGVuY2UvZHJhcGVzXCI6IGpvaW4oX19yZXBvLCBcIi4vc3Vic3lzdGVtcy9kcmFwZXMvbW9kLmpzXCIpLCAvLyA/IG5lZWRlZCA/XG5cbiAgICAgIC8vIFRCRFxuICAgICAgLy8gIyBcIkBjbGllbnQvc2hhZGNuL1wiOiBqb2luKF9fZGlybmFtZSwgXCIuL3NyYy9jb21wb25lbnRzL3NoYWRjbi9cIiksXG4gICAgICAvLyAjIFwiQGFzc2V0cy9cIjogZW52LmdldChcIlZJVkFfQVNTRVRTX0RJUlwiKSB8fCBqb2luKGVudi5nZXQoXCJWSVZBX0NPTkZJR19ESVJcIiksIFwiLi9hc3NldHMvXCIpLCAvLyBpIHdhbnQgdG8gYWNjZXNzIHRvICR2aXZhX2NvbmZpZ19kaXIvYXNzZXRzIHByZXNlbnQgYXMgQGNsaWVudC9hc3NldHNcbiAgICAgIC8vIFwiQHN0YXRpYy9pY29ucy9cIjogam9pbihfX2Rpcm5hbWUsIFwiLi9zdGF0aWMvaWNvbnMvXCIpLFxuICAgICAgLy8gXCIkc3RhdGljL2ltYWdlcy9cIjogam9pbihfX2Rpcm5hbWUsIFwiLi9zdGF0aWMvaW1hZ2VzL1wiKSxcbiAgICB9LFxuICAgIGV4dGVuc2lvbnM6IFtcIi50c1wiLCBcIi5qc1wiLCBcIi5qc3hcIiwgXCIuanNvblwiLCBcIi5zdmVsdGVcIiwgXCIuc3ZnXCIsIFwiLm1qc1wiXSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE2VSxPQUFPLFVBQVU7QUFDOVYsU0FBUyxLQUFLLGNBQWM7QUFDNUIsU0FBUyxpQkFBaUI7QUFDMUIsU0FBUyxTQUFTLFlBQVk7QUFDOUIsU0FBUyxxQkFBcUI7QUFKaUwsSUFBTSwyQ0FBMkM7QUFLaFEsSUFBTSxZQUFZLFFBQVEsY0FBYyx3Q0FBZSxDQUFDO0FBQ3hELElBQU0sU0FBUyxLQUFLLFdBQVcsUUFBUTtBQUN2QyxJQUFNLE9BQU8sS0FBSyxRQUFRLGNBQWM7QUFFeEMsZUFBZSxlQUFlO0FBQzVCLFFBQU0sV0FBVyxNQUFNLE9BQU8sb0JBQW9CLEdBQUc7QUFDckQsUUFBTSxRQUFRLFNBQVMsTUFBTTtBQUM3QixVQUFRLE1BQU0sU0FBUyxRQUFRLFFBQVEsRUFBRSxNQUFNO0FBQy9DLFFBQU0sU0FBUyxRQUFRLFNBQVMsUUFBUTtBQVN4QyxTQUFPO0FBQUEsSUFDTCxNQUFNLEVBQUUsUUFBUSxPQUFPLFFBQVEsUUFBUSxTQUFTO0FBQUEsSUFDaEQsUUFBUSxPQUFPLFFBQVEsUUFBUTtBQUFBO0FBQUEsSUFHL0IsTUFBTSxPQUFPLFFBQVEsTUFBTTtBQUFBLElBQzNCLE1BQU0sU0FBUyxPQUFPLFFBQVEsTUFBTSxJ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
