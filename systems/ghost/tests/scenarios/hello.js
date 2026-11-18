import { STUB_FACULTIES } from "../../../../commons/fixtures/testing/data/stub.js";
import paladin from "@vivalence/paladin";
import { hello } from "@vivalence/runtime/scenarios";

export const MEMO = await paladin.read.json(paladin.scope.repository.branch("commons/fixtures/memo/instance/instance.viva.json"));

export const RECIPE = {
  ...hello.RECIPE,
  runtime: {
    ...hello.RECIPE.runtime,
    hallucinators: [{ module: "@commons/hallucinator/stub", faculties: STUB_FACULTIES }],
  },
  daemons: [...hello.RECIPE.daemons, ...MEMO.daemons],
};

export const DEMO = {
  ...RECIPE,
  lighthouse: { ...RECIPE.lighthouse, traits: ["JOINABLE", "AUTOLOGIN"] },
  clients: [
    {
      manifest: { type: "client", slug: "ghost", traits: ["HOME"] },
      modes: ["@commons/home/console"],
      trait: { HOME: { reference: "/runtime/house/mode/home/probe" } },
    },
  ],
};

export const boot = (options = {}) => hello.boot({ prefix: "viva-ghost-", recipe: RECIPE, ...options });
