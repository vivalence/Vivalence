import { v } from "@vivalence/typology";

const { RuntimeMask } = v.primitives.instance;

const literal = () => ({
  statics: { serve: "http://0.0.0.0:2501" },
  mountpoint: "/viva/instances/chess/mountpoint",
  reference: "/runtime/runtime",
});

const kind = (held) => held?.constructor?.name;
const read = (mask) => ({ serve: kind(mask.statics.serve), mountpoint: kind(mask.mountpoint), reference: kind(mask.reference) });

const given = literal();
const cast = RuntimeMask.cast(given);
const decodedCast = RuntimeMask.decode(cast);

const kept = literal();
RuntimeMask.cast(kept);
const decodedKept = RuntimeMask.decode(kept);

console.log(
  JSON.stringify(
    {
      "cast returns the object it was given": cast === given,
      "the object cast returned, frozen": Object.isFrozen(cast),
      "decode(cast's return) returns it": decodedCast === cast,
      "cast's return after decode": read(cast),
      "decode(cast's return), returned": read(decodedCast),
      "the literal after cast, frozen": Object.isFrozen(kept),
      "decode(the literal) returns it": decodedKept === kept,
      "the literal after decode": read(kept),
      "decode(the literal), returned": read(decodedKept),
    },
    null,
    2,
  ),
);
