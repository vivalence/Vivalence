import { assert, assertEquals } from "@std/assert";
import { shard, steer, ToolCall, Vector } from "@vivalence/typology";
import { tools } from "../tools/index.js";

const SAMPLE = [
  [
    {
      index: 1,
      token: "María",
      lemma: "María",
      upos: "PROPN",
      feats: null,
      deprel: "nsubj",
      head: 3,
      start_char: 0,
      end_char: 5,
    },
    {
      index: 2,
      token: "se",
      lemma: "él",
      upos: "PRON",
      feats: "Case=Acc,Dat|Person=3|PrepCase=Npr|PronType=Prs|Reflex=Yes",
      deprel: "obj",
      head: 3,
      start_char: 6,
      end_char: 8,
    },
    {
      index: 3,
      token: "mira",
      lemma: "mirar",
      upos: "VERB",
      feats: "Mood=Ind|Number=Sing|Person=3|Tense=Pres|VerbForm=Fin",
      deprel: "root",
      head: 0,
      start_char: 9,
      end_char: 13,
    },
  ],
];

const armed = new Vector()
  .use(shard.context.bind("service", async ({ text }) => SAMPLE))
  .slurp(tools);

const invoke = (name, input) =>
  steer.dispatch.invoke(armed, new ToolCall(name).signal, steer.strategy.guarded)(input);

Deno.test("nlp classify — the annotation fold", async (t) => {
  await t.step("folds tokens into flat annotations", async () => {
    const spoken = await invoke("classify", { text: "María se mira" });
    const [sentence] = spoken.output.sentences;
    assertEquals(sentence.length, 3);

    const [maria, se, mira] = sentence;
    assertEquals(maria, { token: "María", lemma: "maría", pos: "propn" });
    assertEquals(se.reflex, "yes");
    assertEquals(se.case, "acc");
    assertEquals(mira, {
      token: "mira",
      lemma: "mirar",
      pos: "verb",
      mood: "ind",
      number: "sing",
      person: "3",
      tense: "pres",
      verbform: "fin",
      suffix: "ar",
    });
  });

  await t.step("drops wire noise — no deprel, head or char offsets survive", async () => {
    const spoken = await invoke("classify", { text: "María se mira" });
    for (const annotation of spoken.output.sentences.flat()) {
      assertEquals(annotation.deprel, undefined);
      assertEquals(annotation.head, undefined);
      assertEquals(annotation.start_char, undefined);
    }
  });

  await t.step("bounces oversized text with a steering message", async () => {
    const spoken = await invoke("classify", { text: "a".repeat(1001) });
    assertEquals(spoken.condition, "ERROR");
    assert(spoken.output.message.includes("1000"));
  });
});
