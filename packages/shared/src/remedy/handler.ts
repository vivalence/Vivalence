export default class RemedyHandler {
  readonly name?: string;
  readonly path: string[];
  readonly violation: string;
  readonly handler: (issue: any, ctx: any) => Promise<any>;

  constructor(options: {
    name?: string;
    path: string[];
    violation: string;
    handler: (issue: any, ctx: any) => Promise<any>;
  }) {
    this.path = options.path;
    this.violation = options.violation;
    this.name = options.name;
    this.handler = options.handler;
  }

  async apply(issue: any, ctx: any): Promise<any> {
    return await this.handler(issue, ctx);
  }
}
