export default class RemedyHandler {
  readonly target: string;
  readonly scope: string[];
  readonly violation: string;
  readonly handler: (issue: any, ctx: any) => Promise<any>;

  constructor({
    target,
    scope,
    violation,
    handler,
  }: {
    target: string;
    scope?: string[];
    violation: string;
    handler: (issue: any, ctx: any) => Promise<any>;
  }) {
    this.target = target;
    this.scope = scope || [];
    this.violation = violation;
    this.handler = handler;
  }

  matches(issue: any): boolean {
    const target = issue.constraint?.target || issue.path[0];
    if (this.target !== target) return false;
    if (this.violation !== issue.violation) return false;

    // Empty scope = catch-all for this target+violation
    if (this.scope.length === 0) return true;

    // Scope is a prefix match against issue.path[1:]
    const issueScope = issue.path.slice(1);
    if (issueScope.length < this.scope.length) return false;
    return this.scope.every((seg, i) => seg === issueScope[i]);
  }

  get specificity(): number {
    return this.scope.length;
  }

  async apply(issue: any, ctx: any): Promise<any> {
    return await this.handler(issue, ctx);
  }
}

// export default class RemedyHandler {
//   readonly name?: string;
//   readonly path: string[];
//   readonly violation: string;
//   readonly handler: (issue: any, ctx: any) => Promise<any>;

//   constructor(options: {
//     name?: string;
//     path: string[];
//     violation: string;
//     handler: (issue: any, ctx: any) => Promise<any>;
//   }) {
//     this.path = options.path;
//     this.violation = options.violation;
//     this.name = options.name;
//     this.handler = options.handler;
//   }

//   async apply(issue: any, ctx: any): Promise<any> {
//     return await this.handler(issue, ctx);
//   }
// }
