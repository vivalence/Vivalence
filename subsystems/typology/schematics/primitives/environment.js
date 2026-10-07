import { v } from "../v.js";

export const KEY = /^(VIVA|PUBLIC_VIVA|SECRET_VIVA)_[A-Z0-9_]+$/;

const KINDS = { string: "String", number: "Number", integer: "Integer", boolean: "Boolean" };

const plain = (schema) =>
  Object.defineProperties({}, {
    ...("~kind" in schema || !KINDS[schema.type] ? {} : { "~kind": { value: KINDS[schema.type] } }),
    ...Object.getOwnPropertyDescriptors(schema),
  });

export const environment = (properties = {}) => {
  const stray = Object.keys(properties).filter((key) => !KEY.test(key));
  if (stray.length)
    throw new Error(
      `[environment] keys outside VIVA_ / PUBLIC_VIVA_ / SECRET_VIVA_: ${stray.join(" ")}`,
    );
  return v.object(
    Object.fromEntries(Object.entries(properties).map(([key, held]) => [key, plain(held)])),
    { additionalProperties: false },
  );
};
