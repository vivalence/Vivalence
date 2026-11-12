import { Vector, v } from "@vivalence/typology";
import * as belt from "../../belt/index.js";

const Heard = v.object({ state: v.enum(["on", "mute"]).desc('The microphone heard or muted. Example: "mute"') });

const STATES = { on: (microphone) => microphone.resume(), mute: (microphone) => microphone.pause() };

export const mic = new Vector().open(
  {
    nature: "/mic",
    rank: "hidden",
    valence: "the microphone heard or muted, mid-dictation or mid-call; nothing it hears while muted is sent. Example: /mic mute",
    input: Heard,
  },
  (ctx) => {
    const { state } = belt.input.cast(Heard, ctx.signal);
    STATES[state](ctx.client.app.box.device.microphone);
    return { microphone: state };
  },
);
