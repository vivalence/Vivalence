import paladin, { factories } from "@vivalence/paladin";
import { Vector, control, trace } from "@vivalence/typology";

const decoder = new TextDecoder();

const said = (record) => `${trace.pathname(record.path)} ${record.track}${"data" in record ? ` ${JSON.stringify(record.data)}` : ""}`;

const follow = (process, kept) => async (shellDie) => {
  const instance = await factories.instance(paladin.instance);
  const log = paladin.ledger.log(instance.manifest.slug);
  (await log.open(process, "spans")).close();
  const path = log.base.branch(`${process}.spans.log`).absolute;
  const reader = await Deno.open(path, { read: true });
  await reader.seek(0, Deno.SeekMode.End);
  const held = control.hold(shellDie.controller).then(() => true);
  shellDie.controller.stdout.log({ tail: path });
  console.log(`tail ${path}`);
  const chunk = new Uint8Array(65536);
  let pending = "";
  try {
    do {
      for (let read = reader.readSync(chunk); read !== null && read > 0; read = reader.readSync(chunk)) {
        const texts = (pending + decoder.decode(chunk.subarray(0, read), { stream: true })).split("\n");
        pending = texts.pop();
        for (const text of texts) {
          const record = JSON.parse(text);
          if (kept(record)) console.log(said(record));
        }
      }
    } while (!(await Promise.race([held, new Promise((resolve) => setTimeout(resolve, 100, false))])));
  } finally {
    reader.close();
  }
};

export const tail = new Vector()
  .open({ nature: "/instance/tail", valence: "follow a running ghost's spans from another terminal. Example: viva instance/tail" }, follow("ghost", () => true))
  .open({ nature: "/instance/tail/ghost", valence: "follow a running ghost's spans, every branch. Example: viva instance/tail/ghost" }, follow("ghost", () => true))
  .open({ nature: "/instance/tail/client", valence: "follow a running ghost's client spans only. Example: viva instance/tail/client" }, follow("ghost", (record) => record.path[1] === "client"));
