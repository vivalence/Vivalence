import { Cortex, belt, shape } from "@vivalence/typology";
import { Cargo } from "../../prototypes/cargo.js";

export const status = async (die, next) => {
  const { daemon } = die;
  daemon.$status.set({ code: "MOUNTING" });
  daemon.$status.set(await daemon.connection.call("/status"));
  const off = daemon.connection.branch("/status").subscribe("/subscribe", (reflection) => daemon.$status.set({ code: reflection.code === "RUNNING" ? "HEALTHY" : "UNAVAILABLE" }), { dropped: () => daemon.$status.set({ code: "UNAVAILABLE" }) });
  try {
    await next();
  } finally {
    off();
  }
};

export const metadata = async (die, next) => {
  const { daemon } = die;
  const [manifest, statics, aperture] = await Promise.all(["/metadata/manifest", "/metadata/statics", "/metadata/aperture"].map((path) => daemon.connection.call(path)));
  daemon.manifest = manifest;
  daemon.statics = statics;
  daemon.call = shape.connection.wire(daemon.connection, aperture);
  daemon.cargo = new Cargo(daemon.connection);
  await daemon.cargo.refetch();
  await next();
};

export const cortex = async (die, next) => {
  const { daemon } = die;
  const stripped = await daemon.connection.call("/metadata/cortex");
  daemon.cortex = new Cortex().register(belt.cortex.wire(daemon.connection.branch("/cortex"), stripped));
  await next();
};

export const modes = async (die, next) => {
  const { daemon, client } = die;
  const { thread } = client.runtime.entities;
  await daemon.entities.mode.find();
  const borne = new Set(daemon.modes.map((mode) => mode.id));
  await Promise.all(thread.$entities.get().filter((held) => borne.has(held.mode)).map((held) => thread.merge({ id: held.id, mode: held.mode })));
  const off = daemon.entities.mode.subscribe();
  try {
    await next();
  } finally {
    off();
  }
};
