import { contexts } from "@vivalence/typology";
import type { Die } from "@vivalence/typology";
import type {} from "./runtime.d.ts";

const reveal = (value: never) => value;

declare const held: Die<typeof contexts.daemon>;
reveal(held.daemon);
