import { v } from "@vivalence/typology";

export const DEFAULT_DOCK = v.traits.terminal.properties.DOCKED.cast({ align: "right", share: 0.38, view: "full", shown: "full", lens: ["turns", "harness"], markdown: "pretty" });

export const SIDES = ["left", "right", "top", "bottom"];

export const VIEWS = ["full", "docked", "messenger", "closed"];

export const LENSES = ["turns", "harness", "repl"];

export const toggled = (list, item) => (list.includes(item) ? list.filter((held) => held !== item) : [...list, item]);

export const MARKDOWNS = ["pretty", "plain"];
