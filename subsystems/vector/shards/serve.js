const MIME = {
  html: "text/html", css: "text/css", js: "application/javascript", mjs: "application/javascript",
  json: "application/json", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg",
  svg: "image/svg+xml", woff2: "font/woff2", wasm: "application/wasm",
  txt: "text/plain", pdf: "application/pdf", mp3: "audio/mpeg", mp4: "video/mp4",
  webp: "image/webp", ico: "image/x-icon", gif: "image/gif",
};

function mime(path) {
  return MIME[path.split(".").pop()?.toLowerCase()] || "application/octet-stream";
}

export function serve(root) {
  const fn = async (ctx) => {
    let i = 0, parts = [];
    while (ctx.params[i] !== undefined) parts.push(ctx.params[i++]);
    const filepath = `${root}/${parts.join("/")}`;
    try {
      const file = await Deno.open(filepath, { read: true });
      ctx.response.type = mime(filepath);
      return file.readable;
    } catch {
      ctx.response.status = 404;
      return null;
    }
  };
  Object.defineProperty(fn, "length", { value: 1 });
  return fn;
}
