import { controller, Vector, shards } from "@vivalence/vector";
import { specimen, Url, Connection } from "@vivalence/typology";
import { Signature, Feature, Pattern, Signal } from "@vivalence/typology";

const nlp = new Connection(new Url("https://nlp.syzygy.vivalence.com"));

class Classifier extends Vector {
  constructor() {
    super();
    // this.use(shards.caching.catchAndRelease((ctx) => JSON.stringify(ctx.)),);
  }
  // on(classifiable, classifier) {return this.open(classifiable, classifier)}
  async classify(signal) {
    const [, apply, , destination] = controller //
      .traverse(this, signal.type);

    // console.log({ signal });

    const features = [];
    for (const effect of destination.effects.values()) {
      const context = { signal, classify: this.classify.bind(this) };
      const result = await apply(context, async (ctx) => await effect(ctx));
      console.log({ result });
    }
  }
}

class Classifiable extends Signature {
  hasher() {
    return hash.array([this.type.hash, this.nature]);
  }
}

class Text extends Classifiable {
  type = new Signal("text");
}

class Token extends Classifiable {
  type = new Signal("token");
}

//

const taxonomist = new Classifier();

taxonomist
  .open(new Pattern("/text/:value"), async (ctx) => {
    const features = await Promise.all(
      ctx.signal.nature
        .split(" ")
        .map((t) => new Token(t, ctx.signal))
        .map((token) => ctx.classify(token)),
    );
    console.log({ features });
    return features;
    // const response = await nlp.call("nlp", {text: ctx.signal.value, language: "es", processors: "tokenize,mwt,pos,lemma,depparse",}); console.log(typeof response, JSON.parse(response));
  })
  .open(new Pattern("/token/:value"), async (ctx) => {
    return new Feature(ctx.signal.nature, {}, ctx.signal);
  });

specimen.describe("classifier", () => {
  // specimen.it("/builds", () => {console.log({ taxonomist });});
  specimen.it("/runs", async () => {
    const text = new Text("vivo en istanbul.");
    const features = await taxonomist.classify(text); // expect(features).toBe([{}, {}, {}]);
    console.log({ text, features });
  });
});
