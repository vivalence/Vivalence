import { v } from "@vivalence/typology";
import { ambient } from "../../../gestalten/ambient.js";

export const app = ambient("app", v.unknown().desc("The App: client · surface · controller · box · bridge · telemetry. Example: ambient.app.consume().bridge"));
export const terminal = ambient("terminal", v.unknown().desc("The terminal this window shows. Example: ambient.terminal.consume().repl"));
