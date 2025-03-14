export interface Pattern {
  type: string;
  match: (signal: Signal) => Step | null;
}

export interface Signal {
  type: string;
  value: any;
}

export interface Factory<T> {
  registerParser(type: string, parser: (input: string) => T[]): void;
  parse(input: string): T[] | null;
}

export interface Step {
  [key: string]: string;
}

export interface Middleware {
  (ctx: Context, next: () => Promise<any>): Promise<any>;
}

export interface Context {
  [key: string]: any;
}

export interface Effect {
  (ctx: Context): Promise<any>;
}
