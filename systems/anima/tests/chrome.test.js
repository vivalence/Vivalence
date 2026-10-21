import { specimen } from "@vivalence/typology";
import { mime } from "@vivalence/typology";
import { fire, paint, settle, surface, words, world } from "./world.js";

const regions = async () => {
  const held = world();
  held.seat();
  held.authorize();
  held.activate();
  const rig = paint(() => surface.Chrome({ client: held.client }));
  await settle();
  return { ...held, rig };
};

specimen.describe("anima chrome — the pane table over the drapes parts", () => {
  specimen.it("the pane table picks Booting → Signin → Regions as the client boots", async () => {
    const held = world();
    specimen.expect(surface.pane(held.client)).toBe(surface.Booting);
    const rig = paint(() => surface.Chrome({ client: held.client }));
    await settle();
    specimen.expect(words(rig.target.querySelector(".island .bootst"))).toBe("booting");
    specimen.expect(words(rig.target.querySelector(".island .wm"))).toBe("VIVALENCE /ANIMA");
    const manifest = held.lighthouse.manifest;
    held.lighthouse.manifest = null;
    held.seat();
    await settle();
    specimen.expect(surface.pane(held.client)).toBe(surface.Booting);
    specimen.expect(words(rig.target.querySelector(".island .bootst"))).toBe("lighthouse");
    specimen.expect(rig.target.querySelector(".island .bootbar i").style.width).toBe("33%");
    held.lighthouse.manifest = manifest;
    held.controller.stdout.log({ lighthouse: "metadata" });
    await settle();
    specimen.expect(surface.pane(held.client)).toBe(surface.Booting);
    specimen.expect(rig.target.querySelector(".island form")).toBe(null);
    held.lighthouse.$status.set({ code: "VERIFYING" });
    await settle();
    specimen.expect(surface.pane(held.client)).toBe(surface.Booting);
    held.lighthouse.$status.set({ code: "IDLE" });
    held.lighthouse.manifest = { ...manifest, traits: [] };
    held.controller.stdout.log({ lighthouse: "no autologin" });
    await settle();
    specimen.expect(surface.pane(held.client)).toBe(surface.Signin);
    specimen.expect(rig.target.querySelector("form#signin")).not.toBe(null);
    specimen.expect([...rig.target.querySelectorAll(".acts button.ghost")].length).toBe(0);
    held.lighthouse.manifest = manifest;
    held.lighthouse.$status.set({ code: "LOGGED_OUT" });
    await settle();
    specimen.expect(surface.pane(held.client)).toBe(surface.Signin);
    held.authorize();
    await settle();
    specimen.expect(surface.pane(held.client)).toBe(surface.Booting);
    specimen.expect(rig.target.querySelector(".island")).not.toBe(null);
    held.activate();
    await settle();
    specimen.expect(surface.pane(held.client)).toBe(surface.Regions);
    specimen.expect(rig.target.querySelector(".client > .body > .split")).not.toBe(null);
    specimen.expect(rig.target.querySelector(".island")).toBe(null);
    specimen.expect(globalThis.document.documentElement.getAttribute("data-theme")).toBe("northsea");
    rig.close();
  });

  specimen.it("settled: IDLE settles only when the lighthouse declares no AUTOLOGIN; the four in-flight standings never do", () => {
    const lighthouse = (code, traits) => ({ status: { code }, manifest: { traits } });
    specimen.expect(surface.settled(lighthouse("IDLE", ["AUTOLOGIN"]))).toBe(false);
    specimen.expect(surface.settled(lighthouse("IDLE", ["JOINABLE"]))).toBe(true);
    specimen.expect(surface.SETTLING.map((code) => surface.settled(lighthouse(code, [])))).toEqual([false, false, false, false]);
    specimen.expect(surface.settled(lighthouse("ERROR", ["AUTOLOGIN"]))).toBe(true);
  });

  specimen.it("sign in calls the lighthouse with the two words — no line, no terminal before it", async () => {
    const held = world();
    held.seat();
    held.lighthouse.login = (username, password) => {
      held.sent.push([username, password]);
      return Promise.resolve();
    };
    held.lighthouse.$status.set({ code: "LOGGED_OUT" });
    const rig = paint(() => surface.Chrome({ client: held.client }));
    await settle();
    const [username, password] = rig.target.querySelectorAll("input");
    username.value = "beef";
    fire(username, "input");
    password.value = "hunter 2";
    fire(password, "input");
    fire(rig.target.querySelector("form"), "submit");
    await settle();
    specimen.expect(words(rig.target.querySelector(".acts button.ghost"))).toBe("autologin");
    specimen.expect(held.sent).toEqual([["beef", "hunter 2"]]);
    rig.close();
  });

  specimen.it("the regions mount the design's skeleton: .client · .tabs · .body (.sidebar · .sbseam · .split) · .panel (empty, hidden) · .modebar · the slots", async () => {
    const { rig } = await regions();
    const client = rig.target.querySelector(".client");
    specimen.expect([...client.children].map((child) => child.className || `@${child.getAttribute("data-r")}`)).toEqual(["tabs", "body", "panel", "modebar", "@wid", "@pop", "@tele", "@island"]);
    specimen.expect([...client.querySelector(".body").children].map((child) => child.className)).toEqual(["sidebar", "sbseam", "split"]);
    specimen.expect(client.querySelector("section.panel[data-zone='0'][data-r='panel']").hasAttribute("hidden")).toBe(true);
    specimen.expect(client.querySelector(".pane.dock")).not.toBe(null);
    specimen.expect(client.querySelector(".pane.frame")).not.toBe(null);
    specimen.expect(rig.target.getAttribute("data-viva")).toBe("northsea");
    rig.close();
  });

  specimen.it("below 768 px .client wears .phone; one pane from $phonePane, tabs and seams gone", async () => {
    const { rig, client } = await regions();
    client.surface.$narrow.set(true);
    await settle();
    specimen.expect(rig.target.querySelector(".client").classList.contains("phone")).toBe(true);
    specimen.expect(rig.target.querySelector(".tabs")).toBe(null);
    specimen.expect(rig.target.querySelector(".sbseam")).toBe(null);
    specimen.expect(rig.target.querySelector(".pane.dock")).not.toBe(null);
    specimen.expect(rig.target.querySelector(".sidebar")).toBe(null);
    client.surface.$phonePane.set("sidebar");
    await settle();
    specimen.expect(rig.target.querySelector(".sidebar")).not.toBe(null);
    specimen.expect(rig.target.querySelector(".pane.dock")).toBe(null);
    rig.close();
  });

  specimen.it("a buffer in the frame splits frame · seam · dock and paints by mime through the renderer table", async () => {
    const { rig, terminal } = await regions();
    terminal.$buffer.set({ id: "buffer-1", mime: mime.json, mode: "chess/chess", traits: ["LABELED"], trait: { LABELED: { name: "board" } }, views: [], files: [], $data: { get: () => ({ turn: "w" }), subscribe: (listener) => (listener({ turn: "w" }), () => {}) } });
    await settle();
    specimen.expect([...rig.target.querySelector(".split").children].map((child) => child.className)).toEqual(["pane frame", "seam v", "pane dock"]);
    specimen.expect(words(rig.target.querySelector(".frame .fhead .fl"))).toBe("◆ artifact");
    specimen.expect(words(rig.target.querySelector(".frame .fbody"))).toContain("turn");
    rig.close();
  });

  specimen.it("the renderer table: a view this client RUNS mounts, else markdown · json · +json · image · html · a line", () => {
    const view = (type, entry, updatedAt) => ({ mime: type, entry: "entry", updatedAt, files: [{ path: "entry", mime: entry }] });
    const buffer = (type) => ({ mime: type });
    specimen.expect(surface.renderer(buffer(mime.json), [view(mime.dom.solid, mime.javascript, "2026-10-21")])).toBe(surface.Mounted);
    specimen.expect(surface.renderer(buffer(mime.json), [view(mime.tty.solid, mime.javascript, "2026-10-21")])).toBe(surface.JsonTree);
    specimen.expect(surface.renderer(buffer(mime.markdown), [])).toBe(surface.Markdown);
    specimen.expect(surface.renderer(buffer("application/vnd.viva.chess+json"), [])).toBe(surface.JsonTree);
    specimen.expect(surface.renderer(buffer("image/png"), [])).toBe(surface.Image);
    specimen.expect(surface.renderer(buffer(mime.html), [])).toBe(surface.Html);
    specimen.expect(surface.renderer(buffer("application/pdf"), [])).toBe(surface.Line);
    const svelte = view(mime.dom.svelte, mime.javascript, "2026-10-20");
    const source = view(mime.dom.solid, mime.dom.solid, "2026-10-22");
    const solid = view(mime.dom.solid, mime.javascript, "2026-10-21");
    specimen.expect(surface.pick([source, svelte, solid])).toBe(solid);
  });
});

specimen.describe("a logout in the tab — the sign-in form keeps the username, forgets the password", () => {
  specimen.it("LOGGED_OUT empties the password and keeps the username; the remounted pane shows the kept username", async () => {
    const held = world();
    held.seat();
    const forget = surface.forgetting(held.client);
    held.client.surface.$signin.set({ user: "beef", pass: "hunter 2" });
    held.lighthouse.$status.set({ code: "LOGGED_OUT" });
    specimen.expect(held.client.surface.signin).toEqual({ user: "beef", pass: "" });
    const rig = paint(() => surface.Chrome({ client: held.client }));
    await settle();
    const [username, password] = rig.target.querySelectorAll("input");
    specimen.expect([username.value, password.value]).toEqual(["beef", ""]);
    rig.close();
    forget();
  });
});
