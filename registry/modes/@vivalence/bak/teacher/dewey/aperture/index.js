import { shards } from "@vivalence/typology";
import { Aperture } from "@vivalence/vector/aperture";
import { conversation } from "./conversation.js";

export default new Aperture() //
  .open("/conversation", conversation);
