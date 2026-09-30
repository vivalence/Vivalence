import paladin from "@vivalence/paladin";
import { fromm, shard, shape } from "@vivalence/typology";

const CARGO_CACHE = "no-cache";

export const services = (execution) => async (die, next) => {
  try {
    for (const service of await die.runtime.processes.service.find()) await service.execute(execution);
    await next();
  } finally {
    await die.runtime.processes.service.kill({}, "SIGTERM");
  }
};

export const daemons = (execution) => async (die, next) => {
  try {
    for (const daemon of await die.runtime.processes.daemon.find()) await daemon.execute(execution);
    await next();
  } finally {
    await die.runtime.processes.daemon.kill({}, "SIGTERM");
  }
};

export const attach = async (die, next) => {
  for (const service of await die.runtime.processes.service.find()) {
    die.runtime.aperture
      .branch(service.reference.absolute)
      .use(shard.context.attach(service.type, service.mask))
      .slurp(service.aperture);
  }

  for (const daemon of await die.runtime.processes.daemon.find()) {
    for (const mode of daemon.flatmodes()) {
      if (!mode.implements("APPLICATION") && !mode.implements("GENERATIVE")) continue;
      const bundler = paladin.bundler(mode.bundles.absolute);

      die.runtime.aperture
        .branch("/attached/bundle")
        .branch(daemon.reference.absolute)
        .branch(mode.reference.absolute)
        .open("/(.*)", async (input, ctx) => {
          const served = await bundler.serve(fromm.params(ctx.params).path.absolute);
          if (!served) {
            ctx.response.status = 404;
            return null;
          }
          ctx.response.type = served.type;
          ctx.response.headers.set("x-viva-integrity", `sha256-${served.integrity}`);
          return served.text;
        });
    }
  }

  for (const daemon of await die.runtime.processes.daemon.find()) {
    const modes = daemon.flatmodes().filter((mode) => mode.implements("FRAUGHT") || mode.implements("MOUNTED"));
    if (!modes.length) continue;

    die.runtime.aperture
      .branch("/attached/cargo")
      .branch(daemon.reference.nature)
      .use(shard.context.bind("daemon", daemon))
      .open("/(.*)", async (input, ctx) => {
        const query = fromm.params(ctx.params).path.absolute.replace(/^[/]/, "");
        for (const mode of modes) {
          const entry = mode.freight.resolve(query);
          if (!entry) continue;
          const filePath = mode.freight.path.branch("/" + entry.path).absolute;
          const stat = await Deno.stat(filePath);
          const etag = `"${stat.size}-${stat.mtime?.getTime() ?? 0}"`;
          const headers = {
            "content-type": entry.type,
            "cache-control": CARGO_CACHE,
            etag,
            "accept-ranges": "bytes",
          };
          if (ctx.request.headers.get("if-none-match") === etag) return new Response(null, { status: 304, headers });
          const bytes = await Deno.readFile(filePath);
          const range = /^bytes=(\d*)-(\d*)$/.exec(ctx.request.headers.get("range") ?? "");
          if (!range) return new Response(bytes, { status: 200, headers });
          const start = range[1] ? Number(range[1]) : Math.max(0, bytes.length - Number(range[2]));
          const end = range[1] && range[2] ? Math.min(Number(range[2]), bytes.length - 1) : bytes.length - 1;
          if (start > end || start >= bytes.length)
            return new Response(null, { status: 416, headers: { ...headers, "content-range": `bytes */${bytes.length}` } });
          return new Response(bytes.subarray(start, end + 1), {
            status: 206,
            headers: { ...headers, "content-range": `bytes ${start}-${end}/${bytes.length}` },
          });
        }
        ctx.response.status = 404;
      });
  }

  await next();
};

export const expose = async (die, next) => {
  for (const daemon of await die.runtime.processes.daemon.find()) {
    const branch = die.runtime.aperture.branch(daemon.reference.nature);
    branch.branch("/status").slurp(shard.nano.atom(daemon.$status));
    branch
      .open("/manifest", () => daemon.manifest)
      .slurp(daemon.aperture)
      .open("/batch", shard.batch.route(branch));
  }
  await next();
};

export const metadata = async (die, next) => {
  const root = die.runtime.aperture.branch("/metadata");

  root.open("/manifest", () => die.mask.manifest);
  root.open("/aperture", () => shape.strip(die.runtime.aperture));

  root.open("/instance", () => ({
    daemons: die.runtime.instance.daemons.map((daemon) => daemon.manifest),
    services: die.runtime.instance.services.map((service) => ({ ...service.manifest, module: service.module })),
  }));

  root.open("/daemons", async () =>
    (await die.runtime.processes.daemon.find()).map((daemon) => ({
      slug: daemon.slug,
      reference: daemon.reference.nature,
      modes: daemon.flatmodes().length,
      metadata: `${daemon.reference.nature}/metadata`,
    })),
  );

  root.open("/services", async () =>
    (await die.runtime.processes.service.find()).map((service) => ({
      type: service.manifest.type,
      slug: service.slug,
      reference: service.reference.absolute,
      metadata: `${service.reference.absolute}/metadata`,
    })),
  );

  await next();
};
