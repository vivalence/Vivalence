import { mount } from "svelte";
import Game from "./Prose.svelte";

// Types, state, keymaps, etc.
export default async function (target, props) {
  return mount(Game, { target, props });
}
