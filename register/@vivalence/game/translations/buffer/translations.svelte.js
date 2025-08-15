import { mount } from "svelte";
import Game from "./Translations.svelte";

export default function (target, props) {
  return mount(Game, { target, props });
}
