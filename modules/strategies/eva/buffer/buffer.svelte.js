import { mount } from "svelte";
import Eva from "./Eva.svelte";

export default async function (target, props) {
  return mount(Eva, { target, props });
}
