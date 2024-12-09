import { mount } from "svelte";
import Game from "./Translations.svelte";

export default async function (target, props) {
  mount(Game, { target, props: { ...props } });
}
