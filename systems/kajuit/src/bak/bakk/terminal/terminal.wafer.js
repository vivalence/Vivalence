import { Vector, Blacklist, is } from "@vivalence/typology";
import { Buffer } from "../entities/buffer.js";

function mint(pojo, mode, terminal) {
  const view = mode.buffered ?? null;
  const buffer = Buffer.from(pojo, view);
  buffer.context = { buffer, terminal };
  buffer.on.release(() => terminal.stall.next());
  if (buffer.id) terminal.daemon.entities.buffer.merge(buffer);
  return buffer;
}

export const terminal = new Vector();

terminal
  .branch("/construct")
  .use(async (die, next) => {
    die.good.daemon = die.variant.daemon;
    die.good.thread = die.variant.thread;
    die.good.mode = die.variant.thread.mode;
    die.good.intent = die.variant.thread.intent ?? null;
    await next();
  })

  .branch("/populate")
  .use(async (die, next) => {
    const intent = die.good.intent;
    const mode = die.good.mode;

    if (intent?.type === "APPLICATIVE" && intent.trait?.FEEDING) {
      const queue = intent.trait.FEEDING.queue ?? 0;
      die.good.stall.withPull(async () => {
        const blacklist = new Blacklist().absorb(die.good.stall.queue);
        const result = await intent.emit({
          thread: die.good.thread.id,
          blacklist,
        });
        if (result.condition !== "NOMINAL") return result;
        return {
          ...result,
          buffers: result.buffers.map((pojo) => {
            const viewMode = die.good.daemon.entities.mode.findOneLocal({
              id: is.id(pojo.mode) ? pojo.mode : pojo.mode.id,
            });
            return mint(pojo, viewMode, die.good);
          }),
        };
      }, queue);
    } else {
      const pojo = mode.buffer
        ? { ...mode.buffer(), thread: die.good.thread.id }
        : { mode: mode.id, thread: die.good.thread.id, data: {} };
      const buffer = mint(pojo, mode, die.good);
      die.good.stall.push(buffer);
    }

    die.good.stall.$status.set("IDLE");
    await next();
  })

  .branch("/resolve")
  .use(async (die, next) => {
    if (die.good.intent?.type === "APPLICATIVE") {
      die.good.stall.pull();
    }
    await next();
  })

  .open("/integrate", async (die) => die.good);
