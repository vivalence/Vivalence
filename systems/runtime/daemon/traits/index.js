import { Freight, is, shape } from "@vivalence/typology";
import paladin from "@vivalence/paladin";
import { join } from "@std/path";

export async function stagger(mode, daemon, traits) {
  const finalizers = [];
  const at = `${mode.manifest.type}/${mode.manifest.slug}`;
  for (const trait of mode.manifest.traits) {
    // a declared trait nothing implements is a wiring bug, not a no-op — say so once.
    if (!traits[trait]) console.warn(`[trait] ${at} declares ${trait}, which nothing implements`);
    const result = await traits[trait]?.(mode, daemon);
    if (is.fn(result)) finalizers.push(result);
    else if (is.object(result)) {
      if (is.fn(result.finalize)) finalizers.push(result.finalize);
      if (is.fn(result.terminate)) {
        (mode.terminators ??= []).push(result.terminate);
      }
    }
  }
  return finalizers;
}

export * from "./dataset.js";
export * from "./datasink.js";
export * from "./intented.js";
export * from "./emitter.js";
export * from "./application.js";
export * from "./booted.js";
export * from "./generative.js";
export * from "./harnessed.js";
export * from "./tooled.js";
export * from "./agentic.js";

export const SELFEVIDENT = () => {};

// marker: the client offers a dock on this mode's threads; the runtime adds nothing.
export const CONVERSATIONAL = () => {};

// marker: only STANDALONE modes can be created/rendered without an emitter (direct buffer from MASKED)
export const STANDALONE = () => {};

export const EXPOSED = (mode) => {
  if (!mode.aperture) {
    console.warn(
      `[EXPOSED] ${mode.manifest.type}/${mode.manifest.slug} has no aperture`,
    );
    return;
  }
  return () => {
    mode.call = shape.proxy(mode.aperture);
  };
};

const carry = async (mode, daemon, root) => {
  await paladin.state.dir(root);
  const files = await paladin.find.walk(/./, mode.statics?.ignore)(root);
  mode.freight = new Freight(root).stow(
    files.map((file) => file.absolute.slice(root.length + 1)),
  );
  mode.freight.withUrl(
    daemon.attach.branch("/cargo").branch(daemon.mount.nature),
  );
  mode.freight.receive = async (path, bytes) => {
    await paladin.state.store(`${root}/${path}`, bytes);
    return mode.freight.admit(path).resolve(path);
  };
  mode.aperture.open("/freight", () => mode.freight.catalog);
};

// freight is what a mode CARRIES: its own files, under its own directory, at the path it declares.
export const FRAUGHT = (mode, daemon) =>
  carry(
    mode,
    daemon,
    join(mode.module.mount.dirname, mode.module.freight.path.nature),
  );

// a mode that SERVES the tree it reads: the operator's mountpoint is the root, and the mode owns none of it.
export const MOUNTED = (mode, daemon) => {
  if (!mode.mountpoint) {
    throw new Error(
      `[MOUNTED] ${mode.manifest.type}/${mode.manifest.slug} serves its mountpoint, but its kernel entry names none`,
    );
  }
  return carry(mode, daemon, mode.mountpoint.absolute);
};
