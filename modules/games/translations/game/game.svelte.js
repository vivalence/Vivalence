import { mount } from "svelte";
import Game, { GameState } from "./Translations.svelte";

export default async function (target, props) {
  const gameState = new GameState(props);
  return mount(Game, { target, props: { ...props, gameState } });
}
