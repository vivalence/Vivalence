import RemedyHandler from "./handler.ts";

interface RemedyFactoryInput {
  asserter: (entity: any, processors?: any) => Promise<any[]>;
  entity: any;
  maxIterations?: number;
  processors?: any;
}

export class Remedy {
  private registry: RemedyHandler[] = new Array();

  private remedies(path: any[], violation: any): RemedyHandler[] {
    const matchingViolation = this.registry.filter(
      (remedy) => remedy.violation === violation,
    );

    const directMatches = matchingViolation.filter(
      (remedy) =>
        remedy.path.length === path.length &&
        remedy.path.every((segment, index) => segment === path[index]),
    );

    if (directMatches.length > 0) {
      return directMatches;
    }

    const wildcardMatches = matchingViolation.filter((remedy) => {
      if (remedy.path[remedy.path.length - 1] !== "*") return false;

      const prefix = remedy.path.slice(0, -1);
      if (prefix.length > path.length) return false;

      return prefix.every(
        (segment, index) => segment === "*" || segment === path[index],
      );
    });

    return wildcardMatches.sort((a, b) => b.path.length - a.path.length);
  }

  public register(remedy: RemedyHandler): void {
    this.registry.push(new RemedyHandler(remedy));
  }

  public async apply(issue: any, ctx: any): Promise<any> {
    issue.status = "PROCESSING";

    const remedies = this.remedies(issue.data.path, issue.data.violation);

    if (remedies.length < 1) {
      return issue.markError({ message: "Missing Remedy" });
    }

    for (const remedy of remedies) {
      await remedy.apply(issue, ctx);
      if (issue.resolved) {
        return issue;
      }
    }

    issue.markError({ message: "Unresolved by handler" });

    return issue;
  }

  public async factory(input: RemedyFactoryInput, ctx: any): Promise<any[]> {
    // TODO: rebuild
    const { asserter, entity, processors, maxIterations = 10 } = input;
    let allIssues: any[] = [];
    let iteration = 0;

    while (iteration < maxIterations) {
      iteration++;

      const issues = await asserter(entity, processors);

      if (issues.length === 0) {
        return [];
      }

      let unresolvedIssues = [];

      for (let issue of issues) {
        if (allIssues.find((slug) => slug === issue.slug)) {
          issue.markError({
            message: `Repetition detected: ${iteration} ${issue.slug}`,
          });
          unresolvedIssues.push(issue);
          break;
        }

        allIssues.push(issue.slug);
        issue.history = [...allIssues];

        await this.apply(issue, ctx);

        if (!issue.resolved) {
          unresolvedIssues.push(issue);
        }
      }

      if (unresolvedIssues.length > 0) {
        return unresolvedIssues;
      }
    }

    const finalIssues = await asserter(entity, processors);

    for (const issue of finalIssues) {
      issue.markError({ message: "Irresolvable" });
    }

    return finalIssues;
  }
}
