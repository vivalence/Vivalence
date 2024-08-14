import { handle } from "../hooks.client.js";

export const load = async (event) => {
  const handled = await handle(event);
  return handled;
};
