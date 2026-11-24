import { home, local } from "../press.js";

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
const KATEX = "https://cdn.jsdelivr.net/npm/katex@0.16/dist/katex.min.css";

const escaped = (text) => text.replace(/[&<>"]/g, (character) => ESCAPES[character]);

const clean = (page) => page.replace(/(^|\/)index\.html$/, "$1").replace(/\.html$/, "");

const reach = (from, page) => `${home(from)}${clean(page)}`;

const listed = (article) => article.status === "published";

const dated = (article) => article.date !== undefined;

const meta = (attribute, entries) =>
  entries
    .filter(([, content]) => content !== undefined)
    .map(([name, content]) => `<meta ${attribute}="${name}" content="${escaped(content)}">`);

export const framed = ({ site, nav, page, title, description, image, type, body }) => {
  const canonical = site.url === undefined ? undefined : `${site.url}/${clean(page)}`;
  const picture = site.url === undefined || !image ? undefined : `${site.url}${image}`;
  const head = [
    `<meta charset="utf-8">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    `<title>${escaped(title)}</title>`,
    ...(canonical === undefined ? [] : [`<link rel="canonical" href="${escaped(canonical)}">`]),
    ...meta("name", [["description", description]]),
    ...meta("property", [
      ["og:type", type],
      ["og:title", title],
      ["og:description", description],
      ["og:url", canonical],
      ["og:image", picture],
    ]),
    ...meta("name", [
      ["twitter:card", picture === undefined ? "summary" : "summary_large_image"],
      ["twitter:title", title],
      ["twitter:description", description],
      ["twitter:image", picture],
    ]),
    ...(body.includes('class="katex"') ? [`<link rel="stylesheet" href="${KATEX}">`] : []),
    `<link rel="stylesheet" href="${home(page)}theme.css">`,
    ...(site.head === "" ? [] : [site.head]),
  ];
  const links = nav.map(
    (entry) => `<a href="${reach(page, entry.page)}">${escaped(entry.title)}</a>`,
  );

  return `<!doctype html>
<html lang="${escaped(site.language)}">
<head>
${head.join("\n")}
</head>
<body>
<header id="top">
<nav>
<a class="logo" href="${home(page)}">${escaped(site.name)}</a>
<small>${links.join(" / ")}</small>
</nav>
</header>
<main>
${body}
</main>
</body>
</html>
`;
};

const subtitle = (article) =>
  article.subtitle === undefined
    ? ""
    : `<span class="subtitle">${escaped(article.subtitle)}</span>`;

const neighbour = (
  from,
  side,
  arrow,
  article,
) => `<a class="neighbour ${side}" href="${reach(from, article.page)}">
<span class="arrow">${arrow}</span>
<span>
<span class="neighbour-title">${escaped(article.title)}</span>
${subtitle(article)}
</span>
</a>`;

const lead = (article) => {
  const source = escaped(local(article.image, article.page));
  return `<img class="lead" src="${source}" alt="${escaped(article.title)}">`;
};

export const essay = ({ site, nav, article, previous, next }) =>
  framed({
    site,
    nav,
    page: article.page,
    title: article.title,
    description: article.subtitle,
    image: article.image,
    type: "article",
    body: `<article class="essay">
<h1 class="title">${escaped(article.title)}</h1>
${subtitle(article)}
<time>${escaped(article.date)}</time>
${article.image ? lead(article) : ""}
<section class="prose">
${article.body}
</section>
<nav class="neighbours">
${next === undefined ? "" : neighbour(article.page, "next", "＜", next)}
${previous === undefined ? "" : neighbour(article.page, "previous", "＞", previous)}
</nav>
<a class="contents" href="${home(article.page)}">↑</a>
</article>`,
  });

export const page = ({ site, nav, article }) =>
  framed({
    site,
    nav,
    page: article.page,
    title: article.title,
    description: article.subtitle,
    image: article.image,
    type: "website",
    body: `<article class="prose">
${article.body}
</article>`,
  });

const tags = (article) =>
  article.tags === undefined
    ? ""
    : `<ul class="tags">${article.tags
        .split(",")
        .map((tag) => `<li>#${escaped(tag.trim())}</li>`)
        .join("")}</ul>`;

const entry = (article) => `<li>
<a href="${reach("index.html", article.page)}">
<h2>${escaped(article.title)}</h2>
${subtitle(article)}
<div class="meta">${tags(article)}<time>${escaped(article.date)}</time></div>
</a>
</li>`;

export const contents = ({ site, nav, essays }) =>
  framed({
    site,
    nav,
    page: "index.html",
    title: site.name,
    type: "website",
    body: `<ul class="essays">
${essays.map(entry).join("\n")}
</ul>`,
  });

export const paged = (site, articles) => {
  const shown = articles.filter((article) => article.status !== "draft");
  const essays = shown.filter(dated).sort((left, right) => left.date.localeCompare(right.date));
  const pages = shown.filter((article) => !dated(article));
  const nav = pages.filter(listed);
  return [
    ...essays.map((article, at) => [
      article.page,
      essay({
        site,
        nav,
        article,
        previous: essays.slice(0, at).findLast(listed),
        next: essays.slice(at + 1).find(listed),
      }),
    ]),
    ...pages.map((article) => [article.page, page({ site, nav, article })]),
    ["index.html", contents({ site, nav, essays: essays.filter(listed).toReversed() })],
  ];
};
