import { Cortex, belt, shape, traits } from "@vivalence/typology";
import { EXPOSED, HARNESSED, KEYMAPPED, REPLING } from "../../entities/mode/traits/index.js";

const catalog = { REPLING, KEYMAPPED, EXPOSED, HARNESSED };

export const SETTLED = ["HEALTHY", "ERROR"];

export const status = (type) => async (die, next) => {
  die[type].$status.set({ code: "MOUNTING" });
  try {
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
  } catch (error) {
    die[type].$status.set({ code: "ERROR", error });
    throw error;
  }
};

export const metadata = (type) => async (die, next) => {
  const [manifest, statics, aperture] = await Promise.all(["/metadata/manifest", "/metadata/statics", "/metadata/aperture"].map((path) => die[type].aperture.call(path)));
  die[type].manifest = manifest;
  die[type].statics = statics;
  die[type].call = shape.connection.wire(die[type].aperture, aperture);
  await next();
};

export const cortex = (type) => async (die, next) => {
  die[type].cortex = new Cortex().register(belt.cortex.wire(die[type].aperture.branch("/cortex"), await die[type].aperture.call("/metadata/cortex")));
  await next();
};

export const mounted = (type) => async (die, next) => {
  const releases = [];
  for (const mode of die[type].modes) {
    for (const finalize of await traits.stagger(mode, die, catalog)) await finalize();
    if ("terminators" in mode) releases.push(...mode.terminators);
  }
  die[type].$status.set({ code: "HEALTHY" });
  die.controller.stdout.log({ [type]: die[type].reference.absolute, modes: die[type].modes.map((mode) => mode.reference.absolute) });
  try {
    await next();
  } finally {
    die[type].$status.set({ code: "RELEASED" });
    for (const release of releases.reverse()) await release();
  }
};
