import { EntitySchema, MikroORM } from "@mikro-orm/sqlite";
import { Type } from "typebox";
import { Value } from "typebox/value";
import { DataEntity, DataRepository } from "@vivalence/typology/entities";

const Ours = Type.Object(
  { input: Type.Integer(), output: Type.Integer(), cost: Type.Optional(Type.Number()) },
  { additionalProperties: false },
);
const Openrouter = Type.Object({ prompt_tokens: Type.Integer(), completion_tokens: Type.Integer(), cost: Type.Optional(Type.Number()) });
const Anthropic = Type.Object({ input_tokens: Type.Integer(), output_tokens: Type.Integer() });
const DIALECTS = [
  [(usage) => "input" in usage, (usage) => usage],
  [(usage) => "prompt_tokens" in usage, (usage) => ({ input: usage.prompt_tokens, output: usage.completion_tokens, cost: usage.cost })],
  [(usage) => "input_tokens" in usage, (usage) => ({ input: usage.input_tokens, output: usage.output_tokens })],
];
const Usage = Type.Codec(Type.Union([Ours, Openrouter, Anthropic]))
  .Decode((usage) => DIALECTS.find(([test]) => test(usage))[1](usage))
  .Encode((usage) => usage);
const Meta = Type.Object(
  {
    state: Type.Optional(Type.String()),
    usage: Type.Optional(Usage),
    provider: Type.Optional(Type.Record(Type.String(), Type.Unknown())),
  },
  { additionalProperties: true },
);
const coerced = (meta) => {
  if (meta === null || meta === undefined || meta.usage === undefined) return meta;
  const decoded = Value.Decode(Meta, meta);
  if (JSON.stringify(decoded.usage) === JSON.stringify(meta.usage)) return meta;
  return { ...decoded, provider: { ...meta.provider, usage: meta.usage } };
};

class Turn extends DataEntity {
  id = "";
  role = "";
  meta = null;
}
const TurnSchema = new EntitySchema({
  class: Turn,
  tableName: "Turn",
  repository: () => DataRepository,
  properties: { id: { type: "string", primary: true }, role: { type: "string" }, meta: { type: "json", nullable: true } },
  hooks: { onLoad: [(args) => { args.entity.meta = coerced(args.entity.meta); }] },
});

const orm = await MikroORM.init({ dbName: ":memory:", contextName: "coerce", entities: [TurnSchema] });
await orm.schema.create();
const connection = orm.em.getConnection();
const stored = {
  t1: { state: "tools", usage: { prompt_tokens: 6692, completion_tokens: 139, total_tokens: 6831, cost: 0.009755 }, provider: { finish_reason: "tool_calls", model: "openai/gpt-5.1" } },
  t2: { state: "complete", usage: { input_tokens: 90, cache_creation_input_tokens: 9489, output_tokens: 124 }, provider: { stop_reason: "end_turn" } },
  t3: { state: "complete", usage: { input: 5, output: 7 } },
};
for (const [id, meta] of Object.entries(stored)) await connection.execute(`insert into Turn (id, role, meta) values ('${id}', 'assistant', '${JSON.stringify(meta)}')`);
const raw = async () => Object.fromEntries((await connection.execute("select id, meta from Turn")).map((row) => [row.id, row.meta === null ? null : JSON.parse(row.meta).usage]));

console.log("--- the rows as stored\n" + JSON.stringify(await raw()));
const em = orm.em.fork();
const loaded = await em.find(Turn, {});
console.log("--- read: the entity's usage\n" + JSON.stringify(Object.fromEntries(loaded.map((turn) => [turn.id, turn.meta.usage]))));
console.log("--- the rows after the read, before any flush\n" + JSON.stringify(await raw()));
em.persist(Object.assign(new Turn(), { id: "t4", role: "user", meta: null }));
await em.flush();
console.log("--- the rows after the next flush (a new turn chained, as the harness does)\n" + JSON.stringify(await raw()));
console.log("--- t2 whole, as written back\n" + JSON.stringify(JSON.parse((await connection.execute("select meta from Turn where id = 't2'"))[0].meta), null, 2));
const again = await orm.em.fork().find(Turn, {});
console.log("--- a second read decodes nothing new:", JSON.stringify(again.map((turn) => turn.meta?.usage ?? null)));
await orm.close();
