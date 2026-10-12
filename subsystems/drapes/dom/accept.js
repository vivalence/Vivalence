import { mime } from "@vivalence/typology";

export const modules = [mime.dom.solid, mime.dom.svelte, mime.dom.html];

export const accept = [...modules, mime.markdown, mime.plain, mime.json];
