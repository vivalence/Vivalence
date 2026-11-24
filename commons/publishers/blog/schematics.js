import { v } from "@vivalence/typology";

export const Article = v.object({
  title: v
    .string()
    .optional()
    .desc("Its headline and its tab's title. Left out, the file's name stands in.")
    .example("The ghost in my sh.el"),
  subtitle: v
    .string()
    .optional()
    .desc("One line under the headline, the description a link preview shows.")
    .example("Physics hands you the nouns. Software makes you invent them."),
  date: v
    .string()
    .optional()
    .desc(
      "The day it is dated, year.month.day. " +
        "A source with a date is an essay: listed, chained to its neighbours. " +
        "A source without one is a page: served, named in the header.",
    )
    .example("2026.02.16"),
  tags: v.string().optional().desc("Its tags, comma-joined.").example("technical, emacs"),
  image: v
    .string()
    .optional()
    .desc("Its picture, a path from the site's root.")
    .example("/images/EVA-1024.jpg"),
  status: v
    .enum(["draft", "unlisted", "published"])
    .default("published")
    .desc("draft: no page. unlisted: a page nobody links. published: listed.")
    .example("unlisted"),
});

export const Site = v.object({
  name: v
    .string()
    .default("blog")
    .desc("The site's name, the header's way home.")
    .example("crackedbeefcake"),
  language: v.string().default("en").desc("The language its pages declare.").example("de"),
  url: v
    .string()
    .optional()
    .desc("Where the site is reached. Canonical links and link previews are minted off it.")
    .example("https://crackedbeefcake.com"),
  head: v
    .string()
    .default("")
    .desc("Markup set into every page's head.")
    .example('<script defer src="https://analytics.example.com/script.js"></script>'),
});

export const Settings = v.object({
  font: v
    .enum(["sans", "serif", "mono"])
    .default("sans")
    .desc("The sheet's typeface.")
    .example("serif"),
  size: v.integer().default(17).desc("The sheet's type size in pixels, 12 to 26.").example(18),
  measure: v
    .integer()
    .default(72)
    .desc("The sheet's line length in characters, 40 to 140.")
    .example(64),
  leading: v.number().default(1.7).desc("The sheet's line height, 1.2 to 2.4.").example(1.8),
  numbers: v.boolean().default(false).desc("Line numbers beside the sheet.").example(true),
  typewriter: v
    .boolean()
    .default(false)
    .desc("The line being written stays in the middle of the sheet.")
    .example(true),
  dim: v
    .boolean()
    .default(false)
    .desc("Every paragraph but the one being written fades.")
    .example(true),
  spellcheck: v.boolean().default(true).desc("The browser's spelling marks.").example(false),
  sync: v
    .boolean()
    .default(true)
    .desc("The page scrolls with the sheet.")
    .example(false),
  autosave: v
    .integer()
    .default(0)
    .desc("Seconds of quiet before a changed source is written; 0 never.")
    .example(5),
  pressing: v
    .boolean()
    .default(false)
    .desc("A save presses the blog too.")
    .example(true),
});

const Dock = (width) =>
  v.object({
    shown: v.boolean().default(true).desc("Whether it is on screen.").example(false),
    width: v.integer().default(width).desc("Its width in pixels.").example(width + 40),
  });

export const Desk = v.object({
  open: v
    .union([v.string(), v.null()])
    .default(null)
    .desc("The source on the desk, its path under source/.")
    .example("on/machines.md"),
  mode: v
    .enum(["write", "split", "preview", "focus"])
    .default("split")
    .desc(
      "What the middle shows: the sheet, the sheet beside its page, the page, " +
        "the sheet alone with every panel away.",
    )
    .example("focus"),
  share: v
    .number()
    .default(0.5)
    .desc("The sheet's share of the middle when split, 0.2 to 0.8.")
    .example(0.6),
  device: v
    .enum(["desktop", "tablet", "phone"])
    .default("desktop")
    .desc("The width the page is shown at.")
    .example("phone"),
  library: Dock(264).default({}).desc("The panel of sources on the left."),
  inspector: v
    .object({
      ...Dock(320).properties,
      tab: v
        .enum(["post", "media", "outline", "stats"])
        .default("post")
        .desc("Its tab: the front matter, the pictures, the headings, the counts.")
        .example("outline"),
    })
    .default({})
    .desc("The panel on the right."),
  settings: Settings.default({}).desc("How the sheet looks and behaves."),
});
