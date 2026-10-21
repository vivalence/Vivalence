import { v } from "@vivalence/typology";

export const DEFAULT_DOCK = v.traits.terminal.properties.DOCKED.cast({ align: "right", share: 0.38, view: "full", shown: "full", lens: "chat", markdown: "pretty" });

export const SIDES = ["left", "right", "top", "bottom"];

export const VIEWS = ["full", "docked", "messenger", "closed"];

export const LENSES = ["chat", "repl", "trace"];

export const MARKDOWNS = ["pretty", "plain"];
