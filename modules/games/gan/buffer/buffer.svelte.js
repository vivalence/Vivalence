import { mount } from "svelte";
import GAN from "./GAN.svelte";

export default async function (target, props) {
  return mount(GAN, { target, props });
}
