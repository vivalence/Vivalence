import { Language, LanguageSupport, defineLanguageFacet, languageDataProp } from "@codemirror/language";
import { parser } from "@lezer/markdown";
import { json } from "@codemirror/lang-json";
import { org } from "./org.js";

const prose = defineLanguageFacet({ commentTokens: { block: { open: "<!--", close: "-->" } } });

const markdownLanguage = new Language(
  prose,
  parser.configure({ props: [languageDataProp.add((type) => (type.isTop ? prose : undefined))] }),
  [],
  "markdown",
);

const markdown = () => new LanguageSupport(markdownLanguage);

const grammars = { md: markdown, mdx: markdown, markdown, org, json, jsonc: json };

export const language = (format) => grammars[format]?.() ?? [];
export const formats = Object.keys(grammars);
