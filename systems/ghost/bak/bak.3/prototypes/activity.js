import { atom, computed } from "nanostores";
import { RemoteRepository, v } from "@vivalence/typology";
import { Entity } from "./entity.js";

export class Activity extends Entity {
  user;
  mode;
  thread;
  buffer;
  turn;
  type;
  $status = atom("IDLE");
  get status() {
    return this.$status.get();
  }
  set status(value) {
    this.$status.set(value);
  }
  error = null;
  steps = [];

  stdin = null;
  stdout = null;

  toJSON() {
    const { $status, stdin, stdout, ...base } = super.toJSON();
    return { ...base, status: this.status };
  }
}

export const roster = (entities, thread) =>
  computed(entities.activity.$entities, (rows) => rows.filter((row) => row.thread === thread));

const RANK = ["RUNNING", "STOPPING", "PAUSED", "IDLE"];
export const loudest = (rows) => RANK.find((code) => rows.some((row) => row.status === code)) ?? "NONE";

export const TONES = {
  IDLE: "idle",
  RUNNING: "primary",
  PAUSED: "caution",
  STOPPING: "caution",
  DONE: "positive",
  STOPPED: "idle",
  FAILED: "negative",
  ABORTED: "negative",
  NONE: "none",
};

export const settled = (code) => Boolean(v.primitives.controller.MACHINE.states[code]?.settled);

export function owed(signal, rows, sent = new Set()) {
  const { MACHINE } = v.primitives.controller;
  const from = MACHINE.transitions[MACHINE.signals[signal]] ?? {};
  return rows.filter((row) => {
    const key = `${signal}:${row.id}`;
    if (!Object.hasOwn(from, row.status) || sent.has(key)) return false;
    sent.add(key);
    return true;
  });
}

export const ActivityDossier = {
  name: "activity",
  kind: () => Activity,
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.runtime.branch("/userspace/entities/activity"));
    return repo;
  },

  use: [
    async (ctx, next) => {
      await next();
      const activity = ctx.dataspace.runtime.branch(`/userspace/entities/activity/${ctx.entity.id}`);
      ctx.entity.stdout = (input = {}, options = {}) =>
        activity.stream("/stdout", options.signal, { method: "POST", body: input, headers: options.headers });
      ctx.entity.stdin = Object.fromEntries(
        Object.keys(v.primitives.controller.MACHINE.signals).map((name) => [name, activity.aim(`/stdin/${name}`)]),
      );
    },
  ],
};
