import { specimen, stamp } from "@vivalence/typology";
import { house } from "../../scenarios/cats/index.js";

const expected = {
  effects: [
    {
      nature: "purr",
      signature: {
        keyed: { command: "p" },
        valence: "emit purr sound",
        directed: { variant: "icon", icon: "waveform" },
        input: { type: "object", properties: { volume: { type: "number" } }, required: ["volume"] },
        output: {
          type: "object",
          properties: { energy: { type: "integer" } },
          required: ["energy"],
        },
      },
    },
    {
      nature: "nap",
      signature: {
        keyed: { command: "n", modifier: "shift" },
        valence: { slug: "nap", name: "Nap", prompt: "restore energy through sleep" },
        input: {
          type: "object",
          properties: { duration: { type: "integer" } },
          required: ["duration"],
        },
      },
    },
  ],
  trajectories: [
    {
      nature: "hunt",
      signature: {
        keyed: { command: "h", modifier: "ctrl" },
        valence: { slug: "hunt", name: "Hunt Mode", prompt: "enter the hunting submenu" },
        directed: {
          variant: "icon",
          label: "Totally not Hunting...",
          icon: "crosshair",
          collapsed: true,
        },
      },
      children: [
        {
          nature: "stalk",
          signature: {
            keyed: { command: "s" },
            valence: "stalk prey silently",
            input: {
              type: "object",
              properties: { patience: { type: "integer" } },
              required: ["patience"],
            },
          },
        },
        {
          nature: "pounce",
          signature: {
            keyed: { command: "p", modifier: "shift" },
            valence: { slug: "pounce", name: "Pounce", prompt: "leap at prey with force" },
            input: {
              type: "object",
              properties: { force: { type: "number" } },
              required: ["force"],
            },
            output: {
              type: "object",
              properties: { energy: { type: "integer" }, alive: { type: "boolean" } },
              required: ["energy", "alive"],
            },
          },
        },
        {
          nature: "retreat",
          signature: {
            keyed: { command: "r" },
            valence: "abandon hunt",
            input: { type: "object", properties: {} },
          },
        },
      ],
    },
  ],
};

specimen.describe("stamp.press", () => {
  specimen.it("stamps cat vector to expected shape", () => {
    const { vector } = house();
    const result = stamp.press(vector);
    console.log({ vector, result });
    specimen.expect(result).toEqual(expected);
  });

  specimen.it("survives JSON roundtrip", () => {
    const { vector } = house();
    const result = stamp.press(vector);
    const roundtripped = JSON.parse(JSON.stringify(result));
    specimen.expect(roundtripped).toEqual(result);
  });
});
