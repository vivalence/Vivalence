import { dirname, join, normalize } from "@std/path";
import { unzipSync } from "npm:fflate@0.8.3";
import { DOMParser, parseHTML } from "linkedom";

const text = (archive, path) => {
  const bytes = archive[path];
  if (bytes === undefined) throw new Error(`epub: ${path} is not in the archive`);
  return new TextDecoder().decode(bytes);
};

const xml = (archive, path) => new DOMParser().parseFromString(text(archive, path), "text/xml");

const opened = (archive) => {
  const container = xml(archive, "META-INF/container.xml");
  const path = container.querySelector("rootfile").getAttribute("full-path");
  const opf = xml(archive, path);
  const items = new Map([...opf.querySelectorAll("manifest > item")].map((item) => [item.getAttribute("id"), item]));
  const nav = [...items.values()].find((item) => (item.getAttribute("properties") ?? "").split(/\s+/).includes("nav"));
  return {
    base: dirname(path),
    title: opf.getElementsByTagName("dc:title")[0]?.textContent.trim() ?? "",
    spine: [...opf.querySelectorAll("spine > itemref")].map((ref) => items.get(ref.getAttribute("idref")).getAttribute("href")),
    nav: nav === undefined ? null : nav.getAttribute("href"),
  };
};

const at = (base, href) => normalize(join(base, decodeURIComponent(href)));

const contents = (archive, opf) => {
  if (opf.nav === null) return {};
  const document = parseHTML(text(archive, at(opf.base, opf.nav))).document;
  const folder = dirname(opf.nav);
  return Object.fromEntries(
    [...document.querySelectorAll("nav a[href]")]
      .map((anchor) => [normalize(join(folder, anchor.getAttribute("href").split("#")[0])), anchor.textContent.replace(/\s+/g, " ").trim()])
      .reverse(),
  );
};

const read = (archive, opf, href) => parseHTML(text(archive, at(opf.base, href))).document;

const headed = (document, href) => document.querySelector("h1, h2, h3")?.textContent.replace(/\s+/g, " ").trim() ?? href;

export const spine = (bytes) => {
  const archive = unzipSync(bytes);
  const opf = opened(archive);
  const titles = contents(archive, opf);
  return {
    title: opf.title,
    files: opf.spine.map((href) => ({ href, title: titles[href] ?? headed(read(archive, opf, href), href), kept: true })),
  };
};

export const epub = (bytes, files) => {
  const archive = unzipSync(bytes);
  const opf = opened(archive);
  return files
    .filter((file) => file.kept)
    .map((file) => ({ title: file.title, root: read(archive, opf, file.href).body }));
};
