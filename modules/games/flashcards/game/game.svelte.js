import { mount } from "svelte";
import Game from "./Flashcards.svelte";
// Types, state, keymaps, etc.

export default async function (target, props) {
  mount(Game, { target, props });
}
