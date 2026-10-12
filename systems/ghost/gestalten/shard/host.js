import { Cortex, belt, shape, traits } from "@vivalence/typology";
import { Cargo } from "../../prototypes/cargo.js";
import * as catalog from "../../entities/mode/traits/index.js";

export const status = (type) => async (die, next) => {
  die[type].$status.set({ code: "MOUNTING" });
  die[type].$status.set(await die[type].aperture.call("/status"));
  const off = die[type].aperture.branch("/status").subscribe(
    "/subscribe",
    (reflection) => {
      if (reflection.code !== "RUNNING") return die[type].$status.set({ code: "UNAVAILABLE" });
      if (die[type].$status.get().code === "UNAVAILABLE") die[type].$status.set({ code: "HEALTHY" });
    },
    { dropped: () => die[type].$status.set({ code: "UNAVAILABLE" }) },
  );
  try {
    await next();
  } finally {
    off();
  }
};

export const metadata = (type) => async (die, next) => {
  const [manifest, statics, aperture] = await Promise.all(["/metadata/manifest", "/metadata/statics", "/metadata/aperture"].map((path) => die[type].aperture.call(path)));
  die[type].manifest = manifest;
  die[type].statics = statics;
  die[type].call = shape.connection.wire(die[type].aperture, aperture);
  die[type].cargo = new Cargo(die[type].aperture);
  await die[type].cargo.refetch();
  await next();
};

export const cortex = (type) => async (die, next) => {
  die[type].cortex = new Cortex().register(belt.cortex.wire(die[type].aperture.branch("/cortex"), await die[type].aperture.call("/metadata/cortex")));
  await next();
};

export const modes = (type) => async (die, next) => {
  await die[type].entities.mode.find();
  const borne = new Set(die[type].modes.map((mode) => mode.id));
  await Promise.all(die.client.runtime.entities.thread.$entities.get().filter((held) => borne.has(held.mode)).map((held) => die.client.runtime.entities.thread.merge({ id: held.id, mode: held.mode })));
  const off = die[type].entities.mode.subscribe();
  try {
    await next();
  } finally {
    off();
  }
};

export const mounted = (type) => async (die, next) => {
  const releases = [];
  for (const mode of die[type].modes) {
    for (const finalize of await traits.stagger(mode, die[type], catalog)) await finalize();
    if ("terminators" in mode) releases.push(...mode.terminators);
  }
  die[type].$status.set({ code: "HEALTHY" });
  die.controller.stdout.message({ [type]: die[type].reference.absolute, modes: die[type].modes.map((mode) => mode.reference.absolute) });
  try {
    await next();
  } finally {
    die[type].$status.set({ code: "RELEASED" });
    for (const release of releases.reverse()) await release();
  }
};
