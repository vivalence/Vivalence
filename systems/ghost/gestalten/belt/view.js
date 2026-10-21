import { crypto, is, mime } from "@vivalence/typology";

const verified = new Map();

export const identity = (reference) => (is.string(reference) ? reference : reference.id);

export const row = (reference, attach) => attach.call(`/view/${identity(reference)}`);

export const candidates = async (buffer, attach) => {
  if (buffer.views.length > 0) return Promise.all(buffer.views.map((reference) => row(reference, attach)));
  if (!is.object(buffer.mode)) return [];
  return Promise.all(buffer.mode.views.map((view) => row(view, attach)));
};

export const entry = (view) => {
  const held = view.files.find((file) => file.path === view.entry);
  if (held === undefined) throw new Error(`[view] ${view.slug}: no file at its entry ${view.entry} — its files: ${view.files.map((file) => file.path).join(" · ") || "none"}`);
  return held;
};

const compiled = (view) => entry(view).mime === mime.javascript;

const compiledFirst = (left, right) => compiled(right) - compiled(left);

export const pick = (views) => views.toSorted(compiledFirst)[0];

export const bytes = async (file, attach) => {
  const response = await fetch(attach.url.branch(`/file/${identity(file)}`).absolute);
  if (!response.ok) throw new Error(`[view] /attached/file/${identity(file)}: ${response.status}`);
  const text = await response.text();
  const digested = `sha256-${await crypto.digest(text)}`;
  const served = response.headers.get("x-viva-integrity");
  const claimed = "integrity" in file ? file.integrity : served;
  if (digested !== served || digested !== claimed)
    throw new Error(`[view] file ${identity(file)}: sha256 ${digested.slice(7, 19)} is not the header's ${String(served).slice(7, 19)} · the row's ${String(claimed).slice(7, 19)}`);
  return text;
};

export const load = async (view, attach) => {
  const file = entry(view);
  if (verified.has(file.integrity)) return verified.get(file.integrity);
  const text = await bytes(file, attach);
  const url = URL.createObjectURL(new Blob([text], { type: "text/javascript" }));
  try {
    const module = await import(url);
    verified.set(file.integrity, module);
    return module;
  } finally {
    URL.revokeObjectURL(url);
  }
};
