import { basename, extname } from "@std/path";
import { createMarkdownProcessor, parseFrontmatter } from "npm:@astrojs/markdown-remark@7.3.8";
import math from "npm:remark-math@6.0.0";
import katex from "npm:rehype-katex@7.0.1";
import raw from "npm:rehype-raw@7.0.0";
import { unified } from "npm:unified@11.0.5";
import uniorg from "npm:uniorg-parse@3.2.0";
import rehype from "npm:uniorg-rehype@2.2.0";
import stringify from "npm:rehype-stringify@10.0.1";
import { parseDocument, Scalar } from "npm:yaml@2.9.1";
import { Article } from "./schematics.js";

const COMMENT = /<!--[\s\S]*?-->/g;
const ROOTED = /^\/(?!\/)/;
const KEYWORD = /^#\+(\w+):[ \t]*(.*)$/gm;

export const home = (page) =>
  page.includes("/") ? "../".repeat(page.split("/").length - 1) : "./";

const uncomment = (node) => {
  if (node.type === "html") node.value = node.value.replace(COMMENT, "");
  if (node.children) node.children.forEach(uncomment);
};

const uncommented = () => uncomment;

export const local = (path, page) => path.replace(ROOTED, home(page));

const rehome = (node, page) => {
  if (node.type === "element") {
    for (const name of ["src", "href"]) {
      if (ROOTED.test(node.properties[name])) {
        node.properties[name] = local(node.properties[name], page);
      }
    }
  }
  if (node.children) node.children.forEach((child) => rehome(child, page));
};

const rehomed = () => (tree, file) => rehome(tree, file.path);

const markdown = await createMarkdownProcessor({
  remarkPlugins: [uncommented, math],
  rehypePlugins: [raw, katex, rehomed],
  shikiConfig: { theme: "dracula" },
});

const org = unified().use(uniorg).use(rehype).use(rehomed).use(stringify);

const LEAD = /^(?:#\+\w+:.*\n)*/;

const MARKUP = [
  {
    suffix: /\.md$/,
    part: (text) => {
      const parsed = parseFrontmatter(text);
      return {
        front: parsed.frontmatter,
        body: parsed.rawFrontmatter === "" ? parsed.content : parsed.content.slice(1),
      };
    },
    join: (draft, text) => {
      const held = parseFrontmatter(text);
      const front = parseDocument(held.rawFrontmatter);
      if (JSON.stringify(held.frontmatter) !== JSON.stringify(draft.front)) {
        for (const key of Object.keys(held.frontmatter))
          if (!(key in draft.front)) front.delete(key);
        for (const [key, value] of Object.entries(draft.front))
          if (JSON.stringify(held.frontmatter[key]) !== JSON.stringify(value))
            front.set(key, Object.assign(new Scalar(value), { type: "QUOTE_DOUBLE" }));
        front.contents.comment = [front.contents.comment, front.comment].filter(Boolean).join("\n");
        front.comment = null;
      }
      const written =
        JSON.stringify(held.frontmatter) === JSON.stringify(draft.front)
          ? held.rawFrontmatter.slice(1)
          : front.toString({ lineWidth: 0 });
      return ["", "{}\n"].includes(written) ? draft.body : `---\n${written}---\n${draft.body}`;
    },
    body: async (text, page) =>
      (await markdown.render(parseFrontmatter(text).content, { fileURL: page })).code,
  },
  {
    suffix: /\.org$/,
    part: (text) => ({
      front: Object.fromEntries(
        [...text.match(LEAD)[0].matchAll(KEYWORD)].map(([, key, value]) => [
          key.toLowerCase(),
          value.trim(),
        ]),
      ),
      body: text.slice(text.match(LEAD)[0].length),
    }),
    join: (draft) =>
      Object.entries(draft.front)
        .map(([key, value]) => `${`#+${key}: ${value}`.trimEnd()}\n`)
        .join("") + draft.body,
    body: async (text, page) => String(await org.process({ value: text, path: page })),
  },
];

export const SOURCES = /\.(md|org)$/;

const markup = (path) => MARKUP.find((markup) => markup.suffix.test(path));

export const parted = (path, text) => markup(path).part(text);

export const joined = (path, draft, text) => markup(path).join(draft, text);

export const fronted = (path, text) => {
  const article = Article.cast(
    Object.fromEntries(
      Object.entries(parted(path, text).front).filter(([key]) => key in Article.properties),
    ),
  );
  const faults = Article.faults(article);
  if (faults.length) {
    throw new Error(
      `[blog] ${path}: ${faults.map((fault) => `${fault.at} ${fault.reason}`).join(" · ")}`,
    );
  }
  return {
    path,
    page: path.replace(markup(path).suffix, ".html"),
    title: basename(path, extname(path)),
    ...article,
  };
};

export const pressed = async (path, text) => {
  const article = fronted(path, text);
  return { ...article, body: await markup(path).body(text, article.page) };
};
