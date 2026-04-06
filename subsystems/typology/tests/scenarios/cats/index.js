import { Vector, v } from "@vivalence/typology";

export const house = () => {
  const state = { energy: 10, alive: true };
  const cat = new Vector();
  const hunt = cat.branch({
    nature: "hunt",
    keyed: { command: "h", modifier: "ctrl" },
    valence: { slug: "hunt", name: "Hunt Mode", prompt: "enter the hunting submenu" },
    directed: {
      variant: "icon",
      label: "Totally not Hunting...",
      icon: "crosshair",
      collapsed: true,
    },
  });

  cat
    .open(
      {
        nature: "purr",
        keyed: { command: "p" },
        valence: "emit purr sound",
        directed: { variant: "icon", icon: "waveform" },
        input: v.object({ volume: v.number() }),
        output: v.object({ energy: v.integer() }),
      },
      (ctx) => {
        state.energy -= 1;
        ctx.output = { energy: state.energy };
      },
    )
    .open(
      {
        nature: "nap",
        keyed: { command: "n", modifier: "shift" },
        valence: { slug: "nap", name: "Nap", prompt: "restore energy through sleep" },
        input: v.object({ duration: v.integer() }),
      },
      (ctx) => {
        state.energy += ctx.request.body.duration * 3;
        ctx.output = { energy: state.energy };
      },
    );

  hunt
    .open(
      {
        nature: "stalk",
        keyed: { command: "s" },
        valence: "stalk prey silently",
        input: v.object({ patience: v.integer() }),
      },
      (ctx) => {
        state.energy -= 2;
        ctx.output = { energy: state.energy };
      },
    )
    .open(
      {
        nature: "pounce",
        keyed: { command: "p", modifier: "shift" },
        valence: { slug: "pounce", name: "Pounce", prompt: "leap at prey with force" },
        input: v.object({ force: v.number() }),
        output: v.object({ energy: v.integer(), alive: v.boolean() }),
      },
      (ctx) => {
        state.energy -= 4;
        state.alive = ctx.request.body.force > 5;
        ctx.output = { energy: state.energy, alive: state.alive };
      },
    )
    .open(
      { nature: "retreat", keyed: { command: "r" }, valence: "abandon hunt", input: v.object({}) },
      (ctx) => {
        state.energy -= 1;
        ctx.output = { energy: state.energy };
      },
    );

  return { vector: cat, state };
};
