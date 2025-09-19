import { atom, computed, map } from "nanostores";
import { env } from "$env/dynamic/public";
import { Connection } from "@vivalence/typology";

import { Runtime, Lighthouse, Repository } from "./index.js";
import lr from "../lifecycles/runtime.js";
import ll from "../lifecycles/lighthouse.js";

export class Client {
  // isAuthorized = computed(this.$authority, (a) => !!a?.access);
  // isIdentified = computed(this.$identity, (i) => !!i);

  remotes = {
    lighthouse: new Repository(Lighthouse, ll),
    runtime: new Repository(Runtime, lr),
  };
}
