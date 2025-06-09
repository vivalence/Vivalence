import { mount } from "svelte";
import GAN from "./GAN.svelte";

export default function (target, props) {
  return mount(GAN, { target, props });
}
