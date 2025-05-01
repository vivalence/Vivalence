import { Parser, Feature, Context, Signal } from "./types.ts";

const identity: Parser = (s, _, n) => n(s);
// const ff: Function = (a: []) => a.flat().filter((x) => !!x);

export class Classifier {
  private parser: Parser;
  private descendants: Classifier[] = [];

  constructor(parser?: Parser) {
    this.parser = parser || identity;
  }

  branch(parser: Parser): Classifier {
    const newClassifier = new Classifier(parser);
    this.descendants.push(newClassifier);
    return this.descendants[this.descendants.length - 1];
  }

  async parse(signal: Signal, ctx: Context): Promise<Feature[]> {
    return await this.parser(signal.value, ctx, async (signals: any[]) => {
      const features: Feature[][] = [];

      for (const descendant of this.descendants) {
        const parsed = await Promise.all(
          signals.map((signal) => descendant.parse(new Signal(signal), ctx)),
        );

        features.push(parsed.flat());
      }

      return features.flat();
    });
  }
}

export default Classifier;
