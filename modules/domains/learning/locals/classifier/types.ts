export interface Feature {
  token: Record<string, any>;
  annotation: Record<string, any>;
}

export interface Context {
  [key: string]: any;
}

export class Signal<T = any> {
  constructor(public readonly value: T) {}
}

export type NextFunction = (signals: any[]) => Promise<Feature[]>;

export type Parser<T = any> = (signal: T, ctx: Context, next: NextFunction) => Promise<Feature[]>;
