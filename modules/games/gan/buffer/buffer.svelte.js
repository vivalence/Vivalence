import { mount } from "svelte";
import GAN from "./GAN.svelte";

export default async function (target, props) {
  mount(GAN, { target, props });
}
