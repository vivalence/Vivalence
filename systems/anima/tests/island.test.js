import { specimen } from "@vivalence/typology";
import { fire, paint, settle, surface, world } from "./world.js";
import { oracle, shape } from "../../../subsystems/drapes/tests/parts/oracle.js";

const BRAND = `<div class="brandline"><span class="viket live" style="width:40px;height:40px" aria-hidden="true"></span><span class="wm caps"><span class="v">VIVALENCE</span>/ANIMA</span></div>`;

const BOOT = `<div class="island" data-zone="2"><div class="card plain boot">${BRAND}<div class="bootbar"><i style="width:33%"></i></div><div class="bootst">lighthouse</div></div></div>`;

const SIGNIN = `<div class="island" data-zone="2"><form class="card plain" id="signin" autocomplete="off">${BRAND}
      <div class="ff"><label for="si-user">user</label><input id="si-user" value=""></div>
      <div class="ff"><label for="si-pass">password</label><input id="si-pass" type="password" value="" placeholder="••••••••"></div>
      <div class="acts"><button type="submit">sign in</button><button type="button" class="ghost" data-line="/lighthouse/login">autologin</button></div></form></div>`;

const REFUSED = `<div class="fine neg">wrong password</div>`;

const JOINABLE = `<div class="acts"><button type="submit">sign in</button><button type="button" class="ghost" data-fn="signup">sign up</button></div>`;

const island = (rig) => rig.target.querySelector("[data-r='island']");

specimen.describe("island — Dom.island: the boot card and the sign-in card over the real lighthouse", () => {
  specimen.it("booting: .card.plain.boot · .brandline · .bootbar at the beats spoken · .bootst the last beat", async () => {
    const held = world();
    held.lighthouse.manifest = null;
    held.seat();
    const rig = paint(() => surface.Chrome({ client: held.client }));
    await settle();
    specimen.expect(shape(island(rig))).toBe(oracle(BOOT));
    rig.close();
  });

  specimen.it("sign in: .ff user · .ff password · .acts; AUTOLOGIN arms the ghost button; ERROR reads .fine.neg and dims the viket", async () => {
    const held = world();
    held.seat();
    held.lighthouse.$status.set({ code: "LOGGED_OUT" });
    const called = [];
    held.lighthouse.autologin = () => called.push("autologin");
    const rig = paint(() => surface.Chrome({ client: held.client }));
    await settle();
    specimen.expect(shape(island(rig))).toBe(oracle(SIGNIN));
    fire(rig.target.querySelector(".acts button.ghost"), "click");
    specimen.expect(called).toEqual(["autologin"]);
    held.lighthouse.$status.set({ code: "ERROR", message: "wrong password" });
    await settle();
    specimen.expect(shape(rig.target.querySelector("#signin")).includes(oracle(REFUSED))).toBe(true);
    specimen.expect(rig.target.querySelector(".brandline .viket").classList.contains("live")).toBe(false);
    rig.close();
  });

  specimen.it("JOINABLE offers sign up: the two words go to lighthouse.signup", async () => {
    const held = world();
    held.seat();
    held.lighthouse.manifest = { ...held.lighthouse.manifest, traits: ["JOINABLE"] };
    held.lighthouse.$status.set({ code: "LOGGED_OUT" });
    const called = [];
    held.lighthouse.signup = (username, password) => called.push(`${username} ${password}`);
    const rig = paint(() => surface.Chrome({ client: held.client }));
    await settle();
    specimen.expect(shape(rig.target.querySelector(".acts").parentElement).includes(oracle(JOINABLE))).toBe(true);
    const [username, password] = rig.target.querySelectorAll(".ff input");
    username.value = "beef";
    fire(username, "input");
    password.value = "hunter2";
    fire(password, "input");
    fire(rig.target.querySelector(".acts button.ghost"), "click");
    specimen.expect(called).toEqual(["beef hunter2"]);
    rig.close();
  });
});
