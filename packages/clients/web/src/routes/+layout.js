import { handle } from "../hooks.client.js";

export const load = async (event) => {
  const ctx = await handle(event);
  return { _event: event, ctx };
};
