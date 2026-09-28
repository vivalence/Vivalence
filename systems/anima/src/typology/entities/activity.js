import { atom, computed } from "nanostores";
import { RemoteRepository, v } from "@vivalence/typology";
import { Entity } from "../prototypes/entity.js";

export class Activity extends Entity {
  user; mode; thread; buffer; turn;
  type;
  $status = atom("IDLE");
  get status() {
    return this.$status.get();
  }
  set status(value) {
    this.$status.set(value ?? "IDLE");
  }
  error = null;
  steps = [];

  stdin = null;
  stdout = null;

  toJSON() {
    const { stdin: _stdin, stdout: _stdout, ...base } = super.toJSON();
    return { ...base, status: this.status };
  }
}

const idOf = (ref) => (ref && typeof ref === "object" ? ref.id : ref) ?? null;

// the roster a surface reads: every live activity on one thread. the dock header, the
// shoulder and the F section all ask the same question, so they ask it in one place.
export const roster = (thread) =>
  computed(
    thread?.daemon?.entities?.activity?.$entities ?? atom([]),
    (rows) => rows.filter((row) => idOf(row.thread) === thread?.id),
  );

// what an indicator shows for a set of rows: the loudest live state, else NONE.
const RANK = ["RUNNING", "STOPPING", "PAUSED", "IDLE"];
export const loudest = (rows = []) =>
  RANK.find((code) => rows.some((row) => row.status === code)) ?? "NONE";

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

export function owed(signal, rows = [], sent = new Set()) {
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
    repo.connect(dataspace.connection.branch("/userspace/entities/activity"));
    return repo;
  },

  use: [
    async (ctx, next) => {
      await next();
      const { id } = ctx.entity;
      ctx.entity.stdin = ctx.daemon.call.userspace.entities.activity[id].stdin;
      ctx.entity.stdout = ctx.daemon.call.userspace.entities.activity[id].stdout;
    },
  ],
};
