import { MikroORM } from "@mikro-orm/core";
import { SqliteDriver } from "@mikro-orm/sqlite";
import { Cortex, Mode, Aperture, Path, Vector, shape, soma } from "@vivalence/typology";
import {
  UserSchema,
  UserEntity,
  ModeSchema,
  ModeEntity,
  ThreadSchema,
  ThreadEntity,
  TurnSchema,
  TurnEntity,
  IntentSchema,
} from "@vivalence/typology/entities";
import { BufferConcrete } from "@vivalence/typology/scenarios";
import paladin from "@vivalence/paladin";
import { CONVERSATIONAL } from "@vivalence/runtime/daemon/traits";

// ─── 1. secrets ───────────────────────────────────────────────────────

await paladin.ikiro;
await paladin.vip.mount(paladin.scope.registry.branch("services"));

const hallucinator = await paladin.vip.accio("@vivalence/hallucinator/anthropic");
const faculties = await hallucinator.provider({
  secrets: { anthropic: paladin.secret.get("SECRET_VIVA_ANTHROPIC_API_KEY") },
});

// ─── 2. ORM ───────────────────────────────────────────────────────────

const orm = await MikroORM.init({
  driver: SqliteDriver,
  dbName: ":memory:",
  entities: [UserSchema, ModeSchema, IntentSchema, ThreadSchema, TurnSchema, BufferConcrete],
  allowGlobalContext: true,
});
await orm.schema.refreshDatabase();
const em = orm.em;

const user = em.create(UserEntity, { roles: ["USER"], config: {} });
const modeEntity = em.create(ModeEntity, {
  slug: "dewey",
  type: "teacher",
  traits: ["EXPOSED", "CONVERSATIONAL"],
  installed: true,
});
await em.flush();

em.setFilterParams("user", { user: user.id });

// ─── 3. cortex + dewey ───────────────────────────────────────────────

const cortex = new Cortex().extend(faculties);

const dewey = new Mode({
  manifest: { type: "teacher", slug: "dewey", traits: ["EXPOSED", "CONVERSATIONAL"] },
});
dewey.aperture = new Aperture();
dewey.mount = new Path("/mode/teacher/dewey");
dewey.entity = modeEntity;
dewey.id = modeEntity.id;
dewey.cake.tune = "balanced";

//@beef
// dialogue, speech, verbatim, object.
dewey.cake.harness = new Vector(); //

dewey.cake.harness
  .branch("/dialogue")
  .use(async (ctx, next) => {
    // @beef
    // ctx = {hallucination}
    // a hallucination is the a temporary one off entity with tune,tool,add,configure etc. its whats resolved by the stream and render effects.
    // the harness is only ever middlewared. the mode.cake's harness isnt expected to implement effects, only middlewares along a shared vector signatures of an enumerable [...dialogue,speech,....faculties]
    // for example for dewey id expect to run
    ctx.hallucination.enhance([
      "You are Dewey, a Brazilian Portuguese tutor.",
      "You help English speakers learn Brazilian Portuguese.",
      "Be concise, warm, and direct. Correct mistakes gently.",
      "Mix Portuguese into your responses naturally.",
      "When the learner asks a question, give a short answer then a practice example.",
    ]);
    await next();
  })
  .use(async (ctx, next) => {
    ctx.hallucination.capabililty / tool(f(x));
    await next();
  });

dewey.cake.harness.branch("/object").use(async (ctx, next) => {
  ctx.hallucination.capabililty / tool(f(y));
  await next();
});

// @beef
// in the CHAOSMONKEY trait i'd take that vector, and setup the same effects over the same set of [...faculties?] (set of faculties being bolted on is a function of the daemon cortex's population.)
// the chaosmonkey trait also needs to put hallucination entity on ctx.
// the ctx.hallucination will be resolved in the (system defined) effects.

dewey.cake.dialogue = new Vector();
dewey.cake.dialogue.open("/chat", async (ctx) => {
  ctx.hallucinate.add(
    [
      "You are Dewey, a Brazilian Portuguese tutor.",
      "You help English speakers learn Brazilian Portuguese.",
      "Be concise, warm, and direct. Correct mistakes gently.",
      "Mix Portuguese into your responses naturally.",
      "When the learner asks a question, give a short answer then a practice example.",
    ].join(" "),
  );
});

const daemon = {
  manifest: { slug: "dewey-live" },
  aperture: new Aperture(),
  twitch: new Vector(),
  entities: {
    em,
    thread: em.getRepository(ThreadEntity),
    turn: em.getRepository(TurnEntity),
  },
  cortex,
};

await CONVERSATIONAL(dewey, daemon);

// ─── 4. create thread ────────────────────────────────────────────────

const thread = em.create(ThreadEntity, {
  user,
  mode: modeEntity,
  trait: {},
  cursor: 0,
  counter: 0,
});
await em.flush();

// ─── 5. REPL ─────────────────────────────────────────────────────────

const write = (text) => Deno.stdout.writeSync(new TextEncoder().encode(text));

let tune = "balanced";

write("dewey live — /tune /quit\n");
write(`tune: ${tune}\n`);

const reader = Deno.stdin.readable.pipeThrough(new TextDecoderStream()).getReader();
let buffer = "";

write("> ");
while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  buffer += value;

  const lines = buffer.split("\n");
  buffer = lines.pop();

  for (const line of lines) {
    if (!line.trim()) {
      write("> ");
      continue;
    }

    if (line.startsWith("/tune ")) {
      tune = line.slice(6).trim() || "balanced";
      write(`tune: ${tune}\n> `);
      continue;
    }
    if (line.trim() === "/quit") {
      await orm.close();
      Deno.exit(0);
    }
    if (line.trim() === "/turns") {
      const turns = await em.find(
        TurnEntity,
        { thread: thread.id },
        { orderBy: { createdAt: "ASC" } },
      );
      write(`\n─── ${turns.length} turns ───\n`);
      for (const turn of turns) {
        const text = turn.parts?.find((part) => part.type === "text")?.text ?? "";
        const preview = text.length > 120 ? text.slice(0, 120) + "…" : text;
        const meta = turn.meta
          ? ` stop=${turn.meta.stop} in=${turn.meta.usage?.input_tokens ?? turn.meta.usage?.input ?? "?"} out=${turn.meta.usage?.output_tokens ?? turn.meta.usage?.output ?? "?"}`
          : "";
        const parent = turn.parent?.id ?? turn.parent ?? "null";
        write(`  [${turn.role}] id=${turn.id} parent=${parent}${meta}\n    ${preview}\n`);
      }
      write(`───────────────\n> `);
      continue;
    }

    try {
      const stream = await dewey.dialogue.chat({
        thread: thread.id,
        message: line,
        tune,
      });

      write("\x1b[2m");
      for await (const packet of stream) {
        if (packet.event === "part.delta" && packet.delta?.text) {
          write(packet.delta.text);
        }
      }
      write("\x1b[0m\n");
    } catch (error) {
      write(`\x1b[31merror: ${error.message}\x1b[0m\n`);
    }

    write("> ");
  }
}
