import { Vector, v } from "@vivalence/typology";
import * as belt from "../../../gestalten/belt/index.js";

const Login = v.object({
  username: v.string().desc('The user\'s slug. Example: "beef"'),
  password: v.string().desc('The password. Example: "hunter2"'),
});

const standing = (lighthouse) => ({ standing: lighthouse.status.code, user: lighthouse.user, traits: lighthouse.manifest.traits });

export const lighthouse = new Vector()
  .open(
    { nature: "/lighthouse", valence: "standing · user · traits. Example: /lighthouse", chord: "leader/s/l" },
    (ctx) => standing(ctx.client.runtime.lighthouse),
  )
  .open(
    { nature: "/lighthouse/login", valence: "sign in with a username and a password; bare, the session is forgotten and the signin pane opens. Example: /lighthouse/login beef hunter2", input: Login },
    async (ctx) => {
      if (ctx.signal.body.length === 0) {
        ctx.client.runtime.lighthouse.logout();
        return standing(ctx.client.runtime.lighthouse);
      }
      const { username, password } = belt.input.cast(Login, ctx.signal);
      await ctx.client.runtime.lighthouse.login(username, password);
      return standing(ctx.client.runtime.lighthouse);
    },
  )
  .open(
    { nature: "/lighthouse/refresh", valence: "refresh the session. Example: /lighthouse/refresh" },
    async (ctx) => {
      await ctx.client.runtime.lighthouse.refresh();
      return standing(ctx.client.runtime.lighthouse);
    },
  )
  .open(
    { nature: "/lighthouse/logout", valence: "sign out — the lighthouse forgets the session. Example: /lighthouse/logout", chord: "leader/s/o" },
    (ctx) => {
      ctx.client.runtime.lighthouse.logout();
      return standing(ctx.client.runtime.lighthouse);
    },
  );
