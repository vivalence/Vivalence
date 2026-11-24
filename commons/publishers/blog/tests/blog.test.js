import { join } from "@std/path";
import {
  Aperture,
  contexts,
  Controller,
  mime,
  Mode,
  Path,
  shard,
  sleep,
  Span,
  specimen,
} from "@vivalence/typology";
import { lifecycle, traits } from "@vivalence/runtime";
import { hello, lighthouse } from "@vivalence/runtime/scenarios";
import * as blog from "../blog.viva.js";
import { fronted, joined, parted, pressed } from "../press.js";
import { Desk, Site } from "../schematics.js";
import { paged } from "../theme/index.js";

const BLOG = "/attached/daemon/hello/mode/publisher/blog";
const MODE = "/daemon/hello/mode/publisher/blog";
const PICTURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
const SHEET = "body { background: hotpink; }\n";

const front = (keys) =>
  `---\n${Object.entries(keys)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n")}\n---\n`;

const GHOST = `${front({
  title: "The ghost in my sh.el",
  subtitle: 'EVA & "friends"',
  date: "2022.09.02",
  tags: "technical, emacs",
  image: "/images/eva.png",
})}
## Say "hello"

A note[^1], some math $e^{i\\pi}$ and a [way home](/).

<!-- never pressed -->

<figure><img src="/images/eva.png" alt="eva" /></figure>

\`\`\`js
const a = 1;
\`\`\`

[^1]: The note.
`;
const SLOP = `${front({ title: "After the slop", date: "2026.02.16" })}\nSlop.\n`;
const WAVES = `${front({ title: "Two steps", date: "2026.02.10", status: "unlisted" })}\nWaves.\n`;
const MACHINES = `${front({ title: "Conscious Machines", date: "2026.08.07" })}\nMachines.\n`;
const HIDDEN = `${front({ title: "Unfinished", date: "2026.09.01", status: "draft" })}\nNot yet.\n`;
const LINKS = `${front({ title: "Linktree" })}\n- [Essays](/)\n`;
const SECOND =
  "#+title: Second\n#+date: 2026.03.01\n#+filetags: :org:\n\n* A heading\n\nOrg text, a [[/images/eva.png][picture]].\n";
const HELLO = "# Hello\n\nThe first page, *by hand*.\n";

const SOURCES = {
  "on/eva.md": GHOST,
  "on/slop.md": SLOP,
  "on/waves.md": WAVES,
  "on/machines.md": MACHINES,
  "on/hidden.md": HIDDEN,
  "linktree.md": LINKS,
};

const all = (sources) =>
  Promise.all(Object.entries(sources).map(([path, text]) => pressed(path, text)));

const seated = (world) => join(world.root, "instance/mountpoint/daemon_hello/mode_publisher_blog");

const wearing = (worn) =>
  hello.boot({
    prefix: "viva-blog-",
    recipe: {
      ...hello.RECIPE,
      daemons: [
        {
          ...hello.RECIPE.daemons[0],
          modes: [
            ...hello.RECIPE.daemons[0].modes,
            { module: "@commons/publisher/blog", traits: worn },
          ],
        },
      ],
    },
  });

const signed = async (world) => {
  await world.post("/lighthouse/signup", { username: "finn", password: "hunter22" });
  const login = await (
    await world.post("/lighthouse/login", { username: "finn", password: "hunter22" })
  ).json();
  return login.authority.access;
};

const sourced = async (world, path, text) => {
  await Deno.mkdir(join(seated(world), "source", path, ".."), { recursive: true });
  await Deno.writeTextFile(join(seated(world), "source", path), text);
};

const page = async (world, path, headers = {}) => {
  const response = await fetch(`${world.origin}${BLOG}${path}`, { headers });
  return {
    status: response.status,
    type: response.headers.get("content-type"),
    etag: response.headers.get("etag"),
    cache: response.headers.get("cache-control"),
    text: await response.text(),
  };
};

const until = async (world, path, held) => {
  const started = Date.now();
  for (;;) {
    const answered = await page(world, path);
    if (held(answered)) return answered;
    if (Date.now() - started > 5000)
      throw new Error(`${path} not as awaited after 5000 ms: ${answered.status}`);
    await sleep.ms(50);
  }
};

specimen.describe("blog press — a source becomes an article", () => {
  specimen.it(
    "markdown: the front matter is the article, the page keeps the source's path",
    async () => {
      const { body, ...article } = await pressed("on/eva.md", GHOST);
      specimen.expect(article).toEqual({
        path: "on/eva.md",
        page: "on/eva.html",
        title: "The ghost in my sh.el",
        subtitle: 'EVA & "friends"',
        date: "2022.09.02",
        tags: "technical, emacs",
        image: "/images/eva.png",
        status: "published",
      });
      specimen.expect(body.startsWith('<h2 id="say-hello">Say “hello”</h2>')).toBe(true);
    },
  );

  specimen.it(
    "markdown: footnotes, math, highlighted code and raw html are pressed; a comment is not",
    async () => {
      const { body } = await pressed("on/eva.md", GHOST);
      specimen.expect(body.includes('data-footnote-ref=""')).toBe(true);
      specimen.expect(body.includes('<section data-footnotes="" class="footnotes">')).toBe(true);
      specimen.expect(body.includes('<span class="katex">')).toBe(true);
      specimen.expect(body.includes('<pre class="astro-code dracula"')).toBe(true);
      specimen.expect(body.includes("<figure>")).toBe(true);
      specimen.expect(body.includes("never pressed")).toBe(false);
    },
  );

  specimen.it(
    "a path from the site's root is rewritten RELATIVE to the page's depth, in markdown, raw html and org",
    async () => {
      const deep = await pressed("on/eva.md", GHOST);
      specimen.expect(deep.body.includes('<a href="../">way home</a>')).toBe(true);
      specimen.expect(deep.body.includes('<img src="../images/eva.png" alt="eva">')).toBe(true);
      const flat = await pressed("eva.md", GHOST);
      specimen.expect(flat.body.includes('<img src="./images/eva.png" alt="eva">')).toBe(true);
      const org = await pressed("articles/second.org", SECOND);
      specimen.expect(org.body.includes('<a href="../images/eva.png">picture</a>')).toBe(true);
      const outside = await pressed(
        "out.md",
        "[cdn](//cdn.example/x) [site](https://example.com/y)\n",
      );
      specimen.expect(outside.body.includes('href="//cdn.example/x"')).toBe(true);
      specimen.expect(outside.body.includes('href="https://example.com/y"')).toBe(true);
    },
  );

  specimen.it(
    "org: its keywords are the article, a keyword the article does not know is left out",
    async () => {
      const { body, ...article } = await pressed("articles/second.org", SECOND);
      specimen.expect(article).toEqual({
        path: "articles/second.org",
        page: "articles/second.html",
        title: "Second",
        date: "2026.03.01",
        status: "published",
      });
      specimen.expect(body.includes("Org text")).toBe(true);
    },
  );

  specimen.it("a source with no front matter is a published page titled by its file name", () => {
    specimen.expect(fronted("notes/untitled.md", HELLO)).toEqual({
      path: "notes/untitled.md",
      page: "notes/untitled.html",
      title: "untitled",
      status: "published",
    });
  });

  specimen.it(
    "parted and joined are a pair: a source comes apart and back byte for byte, an edit in place",
    () => {
      for (const [path, text] of [
        ...Object.entries(SOURCES),
        ["articles/second.org", SECOND],
        ["notes/untitled.md", HELLO],
        ["notes/untitled.org", "* Bare\n"],
      ]) {
        specimen.expect([path, joined(path, parted(path, text), text)]).toEqual([path, text]);
      }
      const eva = parted("on/eva.md", GHOST);
      specimen.expect(eva.body.startsWith('\n## Say "hello"')).toBe(true);
      const drafted = { ...eva, front: { ...eva.front, status: "draft" } };
      specimen
        .expect(joined("on/eva.md", drafted, GHOST))
        .toBe(GHOST.replace('.png"\n---', '.png"\nstatus: "draft"\n---'));
      const remarked = GHOST.replace("---\n\n##", '# lead: "/images/old.png"\n---\n\n##');
      const retitled = { ...parted("on/eva.md", remarked), front: { title: "Renamed" } };
      specimen
        .expect(joined("on/eva.md", retitled, remarked).split("\n---\n")[0])
        .toBe('---\ntitle: "Renamed"\n# lead: "/images/old.png"');
      const second = parted("articles/second.org", SECOND);
      specimen
        .expect(second.front)
        .toEqual({ title: "Second", date: "2026.03.01", filetags: ":org:" });
      specimen.expect(second.body.startsWith("\n* A heading")).toBe(true);
      specimen
        .expect(joined("notes/new.md", { front: {}, body: "Plain.\n" }, ""))
        .toBe("Plain.\n");
    },
  );

  specimen.it("front matter that does not hold throws, naming the source and the key", () => {
    specimen
      .expect(() => fronted("on/eva.md", front({ status: "live" })))
      .toThrow("[blog] on/eva.md: /status");
    specimen
      .expect(() => fronted("on/eva.md", "---\ndate: 2026-02-16\n---\n"))
      .toThrow("/date must be string");
  });
});

specimen.describe("blog desk — what the buffer holds", () => {
  specimen.it("an empty buffer is a whole desk: every panel, mode and setting valued", () => {
    specimen.expect(Desk.cast({})).toEqual({
      open: null,
      mode: "split",
      share: 0.5,
      device: "desktop",
      library: { shown: true, width: 264 },
      inspector: { shown: true, width: 320, tab: "post" },
      settings: {
        font: "sans",
        size: 17,
        measure: 72,
        leading: 1.7,
        numbers: false,
        typewriter: false,
        dim: false,
        spellcheck: true,
        sync: true,
        autosave: 0,
        pressing: false,
      },
    });
  });

  specimen.it("a desk saved by an older desk keeps its source and gains the rest", () => {
    const older = Desk.cast({ open: "on/eva.md", view: "split", rail: "outline" });
    specimen
      .expect([older.open, older.mode, older.inspector.tab])
      .toEqual(["on/eva.md", "split", "post"]);
    specimen.expect(Desk.faults(older)).toEqual([]);
  });
});

specimen.describe("blog theme — the articles become a site", () => {
  const site = Site.cast({ name: "crackedbeefcake" });
  const reached = Site.cast({
    name: "crackedbeefcake",
    url: "https://crackedbeefcake.com",
    head: "<script defer></script>",
  });

  specimen.it(
    "an essay per dated source, a page per undated one, an index; a draft is none of them",
    async () => {
      const pages = paged(site, await all(SOURCES));
      specimen
        .expect(pages.map(([path]) => path))
        .toEqual([
          "on/eva.html",
          "on/waves.html",
          "on/slop.html",
          "on/machines.html",
          "linktree.html",
          "index.html",
        ]);
    },
  );

  specimen.it(
    "the index lists the published essays, newest first; an unlisted one and a page are not on it",
    async () => {
      const index = new Map(paged(site, await all(SOURCES))).get("index.html");
      const listed = [...index.matchAll(/<a href="\.\/(on\/[^"]+)">/g)].map(([, href]) => href);
      specimen.expect(listed).toEqual(["on/machines", "on/slop", "on/eva"]);
      specimen.expect(index.includes("<title>crackedbeefcake</title>")).toBe(true);
      specimen
        .expect(index.includes('<ul class="tags"><li>#technical</li><li>#emacs</li></ul>'))
        .toBe(true);
      specimen.expect(index.includes("<time>2022.09.02</time>")).toBe(true);
    },
  );

  specimen.it(
    "an essay is chained to its published neighbours; an unlisted one is skipped, yet chained itself",
    async () => {
      const pages = new Map(paged(site, await all(SOURCES)));
      const slop = pages.get("on/slop.html");
      specimen.expect(slop.includes('<a class="neighbour next" href="../on/machines">')).toBe(true);
      specimen.expect(slop.includes('<a class="neighbour previous" href="../on/eva">')).toBe(true);
      specimen.expect(slop.includes("Two steps")).toBe(false);
      const waves = pages.get("on/waves.html");
      specimen.expect(waves.includes('<a class="neighbour next" href="../on/slop">')).toBe(true);
      specimen.expect(waves.includes('<a class="neighbour previous" href="../on/eva">')).toBe(true);
      specimen.expect(pages.get("on/machines.html").includes('class="neighbour next"')).toBe(false);
    },
  );

  specimen.it(
    "a published page is named in every header; a page reaches the sheet and home RELATIVE to its depth",
    async () => {
      const pages = new Map(paged(site, await all(SOURCES)));
      const essay = pages.get("on/eva.html");
      specimen
        .expect(essay.includes('<small><a href="../linktree">Linktree</a></small>'))
        .toBe(true);
      specimen.expect(essay.includes('<link rel="stylesheet" href="../theme.css">')).toBe(true);
      specimen.expect(essay.includes('<a class="logo" href="../">crackedbeefcake</a>')).toBe(true);
      specimen
        .expect(
          essay.includes('<img class="lead" src="../images/eva.png" alt="The ghost in my sh.el">'),
        )
        .toBe(true);
      const links = pages.get("linktree.html");
      specimen.expect(links.includes('<link rel="stylesheet" href="./theme.css">')).toBe(true);
      specimen.expect(links.includes('<a href="./">Essays</a>')).toBe(true);
      specimen.expect(links.includes('class="essay"')).toBe(false);
    },
  );

  specimen.it(
    "the head: title and subtitle escaped, a link preview; canonical and picture only when the site says where it is",
    async () => {
      const bare = new Map(paged(site, await all(SOURCES))).get("on/eva.html");
      specimen.expect(bare.includes("<title>The ghost in my sh.el</title>")).toBe(true);
      specimen
        .expect(bare.includes('<meta name="description" content="EVA &amp; &quot;friends&quot;">'))
        .toBe(true);
      specimen.expect(bare.includes('<meta property="og:type" content="article">')).toBe(true);
      specimen.expect(bare.includes('<meta name="twitter:card" content="summary">')).toBe(true);
      specimen.expect(bare.includes("canonical")).toBe(false);
      specimen.expect(bare.includes("og:image")).toBe(false);
      specimen.expect(bare.includes("katex.min.css")).toBe(true);

      const pages = new Map(paged(reached, await all(SOURCES)));
      const essay = pages.get("on/eva.html");
      specimen
        .expect(essay.includes('<link rel="canonical" href="https://crackedbeefcake.com/on/eva">'))
        .toBe(true);
      specimen
        .expect(
          essay.includes(
            '<meta property="og:image" content="https://crackedbeefcake.com/images/eva.png">',
          ),
        )
        .toBe(true);
      specimen
        .expect(essay.includes('<meta name="twitter:card" content="summary_large_image">'))
        .toBe(true);
      specimen.expect(essay.includes("<script defer></script>\n</head>")).toBe(true);
      const index = pages.get("index.html");
      specimen
        .expect(index.includes('<link rel="canonical" href="https://crackedbeefcake.com/">'))
        .toBe(true);
      specimen.expect(index.includes("katex.min.css")).toBe(false);
    },
  );

  specimen.it("the articles are not mutated", async () => {
    const articles = await all(SOURCES);
    const before = structuredClone(articles);
    paged(site, articles);
    specimen.expect(articles).toEqual(before);
  });
});

specimen.describe(
  "blog — the desk: SURFACED, the manifest's own word; a signed-in client writes, presses, a stranger reads",
  () => {
    let world;
    let token;

    const call = async (path, body) => {
      const response = await world.post(`${MODE}${path}`, body, token);
      return { status: response.status, body: await response.json() };
    };

    specimen.beforeAll(async () => {
      world = await wearing([]);
      token = await signed(world);
      for (const [path, text] of Object.entries(SOURCES)) await sourced(world, path, text);
      await Deno.mkdir(join(seated(world), "source/images"), { recursive: true });
      await Deno.writeFile(join(seated(world), "source/images/eva.png"), PICTURE);
    });

    specimen.afterAll(async () => {
      await world.stop();
    });

    specimen.it(
      "a source saved by hand builds nothing by itself: no watch, no twitch without their word",
      async () => {
        await sleep.ms(800);
        specimen.expect((await page(world, "/on/eva.html")).status).toBe(404);
      },
    );

    specimen.it("every route of the desk sits behind the login", async () => {
      for (const path of [
        "/build",
        "/source/list",
        "/source/read",
        "/source/write",
        "/source/remove",
        "/source/move",
        "/source/preview",
      ]) {
        const refused = await world.post(`${MODE}${path}`, { path: "on/eva.md", text: "" });
        specimen.expect([path, refused.status]).toEqual([path, 401]);
        await refused.body?.cancel();
      }
      specimen.expect(await Deno.readTextFile(join(seated(world), "source/on/eva.md"))).toBe(GHOST);
    });

    specimen.it(
      "/build answers every file it wrote; a second build writes none; an edit rewrites its page and the index",
      async () => {
        const first = await call("/build", {});
        specimen.expect(first.body).toEqual({
          pages: [
            "on/eva.html",
            "on/waves.html",
            "on/slop.html",
            "on/machines.html",
            "linktree.html",
            "index.html",
          ],
          gone: [],
        });
        specimen.expect((await call("/build", {})).body).toEqual({ pages: [], gone: [] });

        await sourced(world, "on/slop.md", SLOP.replace("After the slop", "After the avalanche"));
        const edited = await call("/build", {});
        specimen.expect(edited.body.pages.includes("on/slop.html")).toBe(true);
        specimen.expect(edited.body.pages.includes("index.html")).toBe(true);
        specimen.expect(edited.body.pages.includes("linktree.html")).toBe(false);
      },
    );

    specimen.it(
      "a stranger reads an essay by its clean address and by its file, the index at the root, each as html",
      async () => {
        const clean = await page(world, "/on/eva");
        specimen.expect([clean.status, clean.type]).toEqual([200, mime.html]);
        specimen
          .expect(clean.text.includes('<h1 class="title">The ghost in my sh.el</h1>'))
          .toBe(true);
        specimen.expect((await page(world, "/on/eva.html")).text).toBe(clean.text);

        const root = await page(world, "/");
        specimen.expect([root.status, root.type]).toEqual([200, mime.html]);
        specimen.expect(root.text).toBe((await page(world, "/index.html")).text);
        specimen.expect((await page(world, "")).text).toBe(root.text);
        specimen.expect(root.text.includes("After the avalanche")).toBe(true);

        specimen.expect((await page(world, "/linktree")).status).toBe(200);
      },
    );

    specimen.it(
      "a draft has no page; an unlisted essay has one the index does not name",
      async () => {
        specimen.expect((await page(world, "/on/hidden")).status).toBe(404);
        specimen.expect((await page(world, "/on/waves")).status).toBe(200);
        specimen.expect((await page(world, "/")).text.includes("Two steps")).toBe(false);
      },
    );

    specimen.it(
      "a page answers with its etag and no-cache; asked again under that etag it is 304 with no body",
      async () => {
        const first = await page(world, "/on/eva");
        specimen.expect(first.etag.startsWith('"sha256-')).toBe(true);
        specimen.expect(first.cache).toBe("no-cache");
        const again = await page(world, "/on/eva", { "if-none-match": first.etag });
        specimen.expect([again.status, again.text]).toEqual([304, ""]);
      },
    );

    specimen.it(
      "the sheet is the package's own file, never copied; a picture of source/ answers from where it lies; his own theme.css shadows the package's",
      async () => {
        const shipped = new URL("../files/theme.css", import.meta.url).pathname;
        const before = world.query("select id, mount from file where path = 'theme.css'");
        specimen.expect(before.map((file) => file.mount)).toEqual([shipped]);
        specimen
          .expect((await page(world, "/theme.css")).text)
          .toBe(await Deno.readTextFile(shipped));

        const picture = await fetch(`${world.origin}${BLOG}/images/eva.png`);
        specimen
          .expect([picture.status, picture.headers.get("content-type")])
          .toEqual([200, "image/png"]);
        specimen.expect(new Uint8Array(await picture.arrayBuffer())).toEqual(PICTURE);
        await specimen
          .expect(Deno.stat(join(seated(world), "public/images/eva.png")))
          .rejects.toThrow(Deno.errors.NotFound);

        await sourced(world, "theme.css", SHEET);
        await call("/build", {});
        specimen.expect((await page(world, "/theme.css")).text).toBe(SHEET);
        const after = world.query("select id, mount from file where path = 'theme.css'");
        specimen
          .expect(after)
          .toEqual([{ id: before[0].id, mount: join(seated(world), "source/theme.css") }]);
      },
    );

    specimen.it(
      "site.json beside source/ names the site and says where it is reached; it is no page",
      async () => {
        await Deno.writeTextFile(
          join(seated(world), "site.json"),
          JSON.stringify({ name: "crackedbeefcake", url: "https://crackedbeefcake.com" }),
        );
        await call("/build", {});
        const essay = await page(world, "/on/eva");
        specimen
          .expect(essay.text.includes('<a class="logo" href="../">crackedbeefcake</a>'))
          .toBe(true);
        specimen
          .expect(
            essay.text.includes('<link rel="canonical" href="https://crackedbeefcake.com/on/eva">'),
          )
          .toBe(true);
        specimen.expect((await page(world, "/site.json")).status).toBe(404);
      },
    );

    specimen.it(
      "an essay turned draft, a source deleted and a picture deleted are gone with the next build, off the disk and the table",
      async () => {
        await sourced(
          world,
          "on/machines.md",
          MACHINES.replace('date: "2026.08.07"', 'date: "2026.08.07"\nstatus: "draft"'),
        );
        await Deno.remove(join(seated(world), "source/on/waves.md"));
        await Deno.remove(join(seated(world), "source/images/eva.png"));
        const built = await call("/build", {});
        specimen
          .expect(built.body.gone.sort())
          .toEqual(["images/eva.png", "on/machines.html", "on/waves.html"]);
        for (const path of ["/on/machines", "/on/waves", "/images/eva.png"]) {
          specimen.expect([path, (await page(world, path)).status]).toEqual([path, 404]);
        }
        await specimen
          .expect(Deno.stat(join(seated(world), "public/on/waves.html")))
          .rejects.toThrow(Deno.errors.NotFound);
        specimen.expect((await page(world, "/")).text.includes("Conscious Machines")).toBe(false);
        specimen.expect((await page(world, "/theme.css")).status).toBe(200);
      },
    );

    specimen.it(
      "/source/list answers where the site is reached and every source, a faulty one with its fault",
      async () => {
        await sourced(
          world,
          "on/broken.md",
          front({ title: "Broken", status: "live" }).replace(/---\n$/, "# kept\n---\n"),
        );
        const shelf = (await call("/source/list", {})).body;
        specimen.expect(shelf.site).toBe(`${world.origin}${BLOG}`);
        specimen
          .expect(shelf.sources.map((source) => source.path))
          .toEqual([
            "linktree.md",
            "on/broken.md",
            "on/eva.md",
            "on/hidden.md",
            "on/machines.md",
            "on/slop.md",
          ]);
        const broken = shelf.sources.find((source) => source.path === "on/broken.md");
        specimen.expect(broken.article).toBe(null);
        specimen.expect(shelf.files).toEqual([{ path: "theme.css", mime: "text/css" }]);
        specimen.expect(broken.fault.startsWith("[blog] on/broken.md: /status")).toBe(true);
        const hidden = shelf.sources.find((source) => source.path === "on/hidden.md");
        specimen
          .expect([hidden.fault, hidden.article.title, hidden.article.status])
          .toEqual([null, "Unfinished", "draft"]);
      },
    );

    specimen.it("a faulty source fails the build loudly, naming it; no page moves", async () => {
      const before = (await page(world, "/")).text;
      const failed = await call("/build", {});
      specimen.expect(failed.status).toBe(500);
      specimen.expect(JSON.stringify(failed.body).includes("on/broken.md: /status")).toBe(true);
      specimen.expect((await page(world, "/")).text).toBe(before);
    });

    specimen.it(
      "/source/write · read · remove are hands on the file; nothing is pressed until /build",
      async () => {
        const draft = {
          path: "on/broken.md",
          front: { title: "Written here", date: "2026.11.23", layout: "wide" },
          body: "\nFrom the desk.\n",
        };
        specimen
          .expect((await call("/source/write", draft)).body)
          .toEqual({ path: "on/broken.md" });
        specimen
          .expect(await Deno.readTextFile(join(seated(world), "source/on/broken.md")))
          .toBe(`${front(draft.front).replace(/---\n$/, "# kept\n---\n")}\nFrom the desk.\n`);
        specimen.expect((await call("/source/read", { path: "on/broken.md" })).body).toEqual(draft);
        specimen.expect((await page(world, "/on/broken")).status).toBe(404);

        await call("/build", {});
        specimen
          .expect((await page(world, "/on/broken")).text.includes("From the desk."))
          .toBe(true);

        specimen
          .expect((await call("/source/remove", { path: "on/broken.md" })).body)
          .toEqual({ path: "on/broken.md" });
        specimen.expect((await call("/build", {})).body.gone).toEqual(["on/broken.html"]);
        specimen.expect((await page(world, "/on/broken")).status).toBe(404);
      },
    );

    specimen.it(
      "/source/move takes a source to a new path, its page follows; a taken path refuses",
      async () => {
        specimen
          .expect((await call("/source/move", { path: "on/slop.md", to: "after/slop.md" })).body)
          .toEqual({ path: "after/slop.md" });
        await specimen
          .expect(Deno.stat(join(seated(world), "source/on/slop.md")))
          .rejects.toThrow(Deno.errors.NotFound);
        const built = await call("/build", {});
        specimen.expect(built.body.gone).toEqual(["on/slop.html"]);
        specimen.expect(built.body.pages.includes("after/slop.html")).toBe(true);
        specimen.expect((await page(world, "/after/slop")).status).toBe(200);

        const taken = await call("/source/move", { path: "after/slop.md", to: "on/eva.md" });
        specimen
          .expect([taken.status, JSON.stringify(taken.body).includes("'on/eva.md' is taken")])
          .toEqual([500, true]);
        specimen
          .expect(await Deno.readTextFile(join(seated(world), "source/on/eva.md")))
          .toBe(GHOST);
        const climb = await call("/source/move", { path: "after/slop.md", to: "../climbed.md" });
        specimen
          .expect([climb.status, JSON.stringify(climb.body).includes("leaves source/")])
          .toEqual([500, true]);
        await specimen
          .expect(Deno.stat(join(seated(world), "climbed.md")))
          .rejects.toThrow(Deno.errors.NotFound);
      },
    );

    specimen.it("no path of the desk leaves source/", async () => {
      for (const path of ["../site.json", "on/../../site.json"]) {
        const read = await call("/source/read", { path });
        specimen
          .expect([path, read.status, JSON.stringify(read.body).includes("leaves source/")])
          .toEqual([path, 500, true]);
        const written = await call("/source/write", { path, front: {}, body: "{}" });
        specimen.expect([path, written.status]).toEqual([path, 500]);
      }
      specimen
        .expect(JSON.parse(await Deno.readTextFile(join(seated(world), "site.json"))).name)
        .toBe("crackedbeefcake");
    });

    specimen.it(
      "/source/preview presses what is typed, a draft too, based on the site; nothing is written",
      async () => {
        const typed = { path: "on/hidden.md", ...parted("on/hidden.md", HIDDEN) };
        typed.body = typed.body.replace("Not yet.", "Typed, not saved.");
        const preview = (await call("/source/preview", typed)).body.html;
        specimen
          .expect(preview.includes(`<base href="${world.origin}${BLOG}/on/hidden.html">`))
          .toBe(true);
        specimen.expect(preview.includes('<h1 class="title">Unfinished</h1>')).toBe(true);
        specimen.expect(preview.includes("Typed, not saved.")).toBe(true);
        specimen
          .expect(preview.includes('<small><a href="../linktree">Linktree</a></small>'))
          .toBe(true);
        specimen
          .expect(await Deno.readTextFile(join(seated(world), "source/on/hidden.md")))
          .toBe(HIDDEN);
        specimen.expect((await page(world, "/on/hidden")).status).toBe(404);
      },
    );

    specimen.it(
      "/source/upload/:name lands a picture's bytes under source/images/; the next build serves it",
      async () => {
        const refused = await fetch(`${world.origin}${MODE}/source/upload/heron.png`, {
          method: "POST",
          body: PICTURE,
        });
        specimen.expect(refused.status).toBe(401);
        await refused.body?.cancel();

        const landed = await fetch(`${world.origin}${MODE}/source/upload/heron.png`, {
          method: "POST",
          headers: { authorization: `Bearer ${token}`, "content-type": "image/png" },
          body: PICTURE,
        });
        specimen.expect(await landed.json()).toEqual({ path: "images/heron.png" });
        specimen
          .expect(await Deno.readFile(join(seated(world), "source/images/heron.png")))
          .toEqual(PICTURE);
        await call("/build", {});
        const picture = await fetch(`${world.origin}${BLOG}/images/heron.png`);
        specimen
          .expect([picture.status, picture.headers.get("content-type")])
          .toEqual([200, "image/png"]);
        await picture.body?.cancel();
      },
    );

    specimen.it("a page never built is 404; no spelling of .. reaches a source", async () => {
      specimen.expect((await page(world, "/nope.html")).status).toBe(404);
      const climbs = [
        "/../source/on/eva.md",
        "/%2e%2e/source/on/eva.md",
        "/..%2fsource%2fon%2feva.md",
        "/%2e%2e%2fsource%2fon%2feva.md",
        "/on/..%2f..%2fsource%2fon%2feva.md",
        "/source/on/eva.md",
        "/on/eva.md",
      ];
      for (const climb of climbs) {
        const answered = await page(world, climb);
        specimen
          .expect([climb, answered.status, answered.text.includes("never pressed")])
          .toEqual([climb, 404, false]);
      }
    });

    specimen.it(
      "the surface holding the desk is bundled from buffer/Blog.jsx and answers its signed-in fetch; a build leaves the bundle",
      async () => {
        const [surface] = world.query("select id, mount, entry from surface where slug = 'blog'");
        specimen
          .expect([surface.mount, surface.entry])
          .toEqual(["buffer/Blog.jsx", "bundle/blog.dom.solid.mjs"]);
        const bundle = await world.get(`/attached/surface/${surface.id}?token=${token}`);
        specimen
          .expect([bundle.status, bundle.headers.get("content-type")])
          .toEqual([200, mime.javascript]);
        const code = await bundle.text();
        for (const called of [
          "source.list()",
          "source.read(",
          "source.write(",
          "source.remove(",
          "source.move(",
          "source.preview(",
          "source.upload[",
          "call.build()",
        ]) {
          specimen.expect([called, code.includes(called)]).toEqual([called, true]);
        }

        specimen.expect((await call("/build", {})).body.gone).toEqual([]);
        specimen
          .expect(
            world
              .query("select path from file where mount like '%/bundle/%'")
              .map((file) => file.path),
          )
          .toEqual(["bundle/blog.dom.solid.mjs"]);
      },
    );
  },
);

specimen.describe(
  "blog — the watch: BOOTED on a recipe's entry, a save under source/ is a page, nobody asking",
  () => {
    let world;

    specimen.beforeAll(async () => {
      world = await wearing(["BOOTED"]);
    });

    specimen.afterAll(async () => {
      await world.stop();
    });

    specimen.it("a file saved by hand is served; saved again, the page follows", async () => {
      await sourced(world, "hello.md", HELLO);
      const first = await until(world, "/hello.html", (answered) => answered.status === 200);
      specimen.expect(first.text.includes('<h1 id="hello">Hello</h1>')).toBe(true);

      await sourced(world, "hello.md", "# Hello\n\nRewritten.\n");
      const second = await until(world, "/hello.html", (answered) =>
        answered.text.includes("Rewritten."),
      );
      specimen.expect(second.text.includes("by hand")).toBe(false);
    });

    specimen.it(
      "a save in a directory made after the boot is heard; an editor's lock file is no page",
      async () => {
        await sourced(world, "articles/.#second.md", "finn@machine.4242");
        await sourced(world, "articles/second.org", SECOND);
        await until(world, "/articles/second.html", (answered) => answered.status === 200);
        specimen.expect((await page(world, "/articles/.#second.html")).status).toBe(404);
        const index = await until(world, "/index.html", (answered) =>
          answered.text.includes("articles/second"),
        );
        specimen.expect(index.text.includes(".#second")).toBe(false);
      },
    );
  },
);

specimen.describe(
  "blog — the twitch: TWITCHY, a File entity recorded under source/ presses the blog",
  () => {
    let scenario;
    let daemon;
    let mode;
    let seat;

    const recorded = async (holder, path, text) => {
      await Deno.mkdir(join(seat, path, ".."), { recursive: true });
      await Deno.writeTextFile(join(seat, path), text);
      await scenario.datamap.shard.scope(async () => {
        await daemon.entities.file.record({
          mode: holder,
          daemon: "italian",
          path,
          mount: join(seat, path),
          mime: mime.of(path),
          bytes: new TextEncoder().encode(text),
        });
      });
      await sleep.ms(60);
    };

    const pressedPage = (path) => Deno.readTextFile(join(seat, "public", path)).catch(() => null);

    specimen.beforeAll(async () => {
      scenario = await lighthouse.create();
      await scenario.seedDaemon("italian");
      const die = {
        runtime: scenario.runtime,
        daemon: {
          type: "daemon",
          slug: "italian",
          reference: new Path("/daemon/italian"),
          domain: {},
          aperture: new Aperture(),
          controller: new Controller({ stdout: new Span("italian") }),
        },
        register: { modes: [] },
      };
      await lifecycle.daemon.population.datamap(die, async () => {});
      daemon = die.daemon;

      seat = await Deno.makeTempDir({ prefix: "viva-blog-twitch-" });
      const module = {
        ...blog,
        manifest: { ...blog.manifest, traits: [...blog.manifest.traits, "TWITCHY"] },
        source: new Path(new URL("../blog.viva.js", import.meta.url).pathname),
      };
      mode = Object.assign(new Mode({ module }), {
        daemon: "italian",
        mountpoint: seat,
        stdout: new Span("mode/publisher/blog"),
      });
      const modeDie = { ...shard.context.lift(contexts.modeDie, daemon), mode, traits: {} };
      await lifecycle.mode.population.core(modeDie, async () => {});
      await (
        await traits.mode.EXPOSED(mode)
      )();
      traits.mode.TWITCHY(mode);
    });

    specimen.afterAll(async () => {
      await scenario.close();
      await Deno.remove(seat, { recursive: true });
    });

    specimen.it(
      "a source recorded for this mode is pressed: its page and the index lie under public/",
      async () => {
        await recorded(mode.id, "source/slop.md", SLOP);
        specimen
          .expect(
            (await pressedPage("slop.html")).includes('<h1 class="title">After the slop</h1>'),
          )
          .toBe(true);
        specimen.expect((await pressedPage("index.html")).includes('<a href="./slop">')).toBe(true);
      },
    );

    specimen.it("the same source recorded again with new bytes is pressed again", async () => {
      await recorded(mode.id, "source/slop.md", SLOP.replace("Slop.", "Rewritten."));
      specimen.expect((await pressedPage("slop.html")).includes("Rewritten.")).toBe(true);
    });

    specimen.it(
      "a file of this mode outside source/ presses nothing; a mode-less file of its daemon neither",
      async () => {
        await Deno.writeTextFile(join(seat, "source/unrecorded.md"), "# Unrecorded\n");
        await recorded(mode.id, "bundle/blog.dom.solid.mjs", "export default 1;\n");
        await recorded(null, "source/dropped.md", "# Dropped\n");
        specimen.expect(await pressedPage("unrecorded.html")).toBe(null);
        specimen
          .expect(mode.stdout.$history.get().filter((record) => record.track === "fault"))
          .toEqual([]);
      },
    );
  },
);
