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
