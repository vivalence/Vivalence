import { mount } from "svelte";
import Game from "./Conjugations.svelte";
// Types, state, keymaps, etc.

export default async function (target, props) {
  mount(Game, { target, props });
}
