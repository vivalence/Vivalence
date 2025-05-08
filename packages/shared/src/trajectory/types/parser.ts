export class Parser<T = any> {
  readonly type: string;
  // readonly pattern: (input: any) => Pattern<T>[]
  // readonly signal: (input: any) => Signal<T>[]
  constructor(
    type: string,
    // pattern: (pattern: any) => Pattern<T>[]
    // signal: (signal: any) => Signal<T>[]
  ) {
    this.type = type;
    // this.patternFactory = pattern;
    // this.signalFactory = signal;
  }
  // get pattern (){return this.patternFactory}
}
