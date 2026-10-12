import { v } from "../v.js";

export const Channel = v.union([
  v.const("handshake"),
  v.const("dialogue"),
  v.const("speech"),
  v.const("verbatim"),
]);

export const Verb = v.union([
  v.const("open"),
  v.const("packet"),
  v.const("close"),
  v.const("abort"),
  v.const("error"),
]);
