import { from, Show } from "solid-js";
import * as ambient from "../../ambient/index.js";
import { Brandline, Island } from "../booting/booting.jsx";

export function Signin() {
  const app = ambient.app.consume();
  const lighthouse = app.client.runtime.lighthouse;
  const status = from(lighthouse.$status);
  const known = from(lighthouse.$user);
  const signin = from(app.bridge.$signin);
  const user = () => signin().user;
  const pass = () => signin().pass;
  const setUser = (user) => app.bridge.$signin.set({ ...app.bridge.signin, user });
  const setPass = (pass) => app.bridge.$signin.set({ ...app.bridge.signin, pass });
  const traits = () => lighthouse.manifest.traits;
  const submit = (event) => {
    event.preventDefault();
    lighthouse.login(user(), pass()).catch((error) => app.client.controller.stdout.fault(error));
  };
  return (
    <Island>
      <form class="card plain" id="signin" autocomplete="off" onSubmit={submit}>
        <Brandline host={app.client.mask.manifest.slug} fault={status().code === "ERROR"} />
        <div class="ff">
          <label for="si-user">user</label>
          <input id="si-user" value={user()} placeholder={known() === null ? "" : known().slug} onInput={(event) => setUser(event.target.value)} />
        </div>
        <div class="ff">
          <label for="si-pass">password</label>
          <input id="si-pass" type="password" value={pass()} placeholder="••••••••" onInput={(event) => setPass(event.target.value)} />
        </div>
        <Show when={status().code === "ERROR"}>
          <div class="fine neg">{status().message}</div>
        </Show>
        <div class="acts">
          <button type="submit">sign in</button>
          <Show when={traits().includes("JOINABLE")}>
            <button type="button" class="ghost" onClick={() => lighthouse.signup(user(), pass())}>
              sign up
            </button>
          </Show>
          <Show when={traits().includes("AUTOLOGIN")}>
            <button type="button" class="ghost" onClick={() => lighthouse.autologin()}>
              autologin
            </button>
          </Show>
        </div>
      </form>
    </Island>
  );
}
