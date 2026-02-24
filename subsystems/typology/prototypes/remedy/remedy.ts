import RemedyHandler from "./handler.ts";

export class Remedy {
  private registry: RemedyHandler[] = [];

  register(definition: any): void {
    this.registry.push(new RemedyHandler(definition));
  }

  find(issue: any): RemedyHandler | null {
    const matches = this.registry
      .filter((h) => h.matches(issue))
      .sort((a, b) => b.specificity - a.specificity);

    return matches[0] || null;
  }

  async apply(issue: any, ctx: any): Promise<void> {
    const handler = this.find(issue);

    if (!handler) {
      return issue.onError({
        message: `No remedy: ${issue.path.join("/")}:${issue.violation}`,
      });
    }

    await handler.apply(issue, ctx);

    if (issue.hasSpawn) {
      const unresolved = await this.many(issue.descendants, ctx); // insecure

      if (unresolved.length > 0) {
        // console.log({ unresolved: unresolved[0] });
        return issue.onError({ message: "Unresolved descendants", unresolved });
      }

      // Descendants resolved — retry this issue
      return await handler.apply(issue, ctx);
    }
  }

  async many(issues: any[], ctx: any): Promise<any[]> {
    for (const issue of issues) {
      if (!issue.resolved) {
        await this.apply(issue, ctx);
      }
    }
    return issues.filter((i) => !i.resolved);
  }
}

// import RemedyHandler from "./handler.ts";

// interface RemedyFactoryInput {
//   constraints: any[];
//   entity: any;
//   maxIterations?: number;
// }

// interface RemedyAssFactoryInput {
//   asserter: (entity: any, processors?: any) => Promise<any[]>;
//   entity: any;
//   maxIterations?: number;
//   processors?: any;
// }

// // INSECURE: there are recursion failure modes
// export class Remedy {
//   private registry: RemedyHandler[] = new Array();

//   private find(path: any[], violation: any): RemedyHandler[] {
//     const matchingViolation = this.registry.filter(
//       (remedy) => remedy.violation === violation,
//     );

//     const directMatches = matchingViolation.filter(
//       (remedy) =>
//         remedy.path.length === path.length &&
//         remedy.path.every((segment, index) => segment === path[index]),
//     );

//     if (directMatches.length > 0) {
//       return directMatches;
//     }

//     const wildcardMatches = matchingViolation.filter((remedy) => {
//       if (remedy.path[remedy.path.length - 1] !== "*") return false;

//       const prefix = remedy.path.slice(0, -1);
//       if (prefix.length > path.length) return false;

//       return prefix.every(
//         (segment, index) => segment === "*" || segment === path[index],
//       );
//     });

//     return wildcardMatches.sort((a, b) => b.path.length - a.path.length);
//   }

//   public register(remedy: RemedyHandler): void {
//     this.registry.push(new RemedyHandler(remedy));
//   }

//   public async apply(issue: any, ctx: any): Promise<any> {
//     issue.status = "PROCESSING";

//     const remedies = this.find(issue.path, issue.violation);

//     if (remedies.length < 1) {
//       return issue.onError({ message: "No Remedy" });
//     }

//     for (const remedy of remedies) {
//       await remedy.apply(issue, ctx);

//       if (issue.hasSpawn) {
//         await this.many(issue.descendants, ctx); // INSECURE

//         if (!issue.hasSpawn) {
//           await this.apply(issue, ctx); // INSECURE
//         } else {
//           issue.onError({ message: "unresolved descendant" });
//         }
//       }
//       if (issue.resolved) return;
//       if (issue.hasError) return;
//     }

//     issue.onError({ message: "Unresolved by handler" });
//   }

//   public async many(issues: any[], ctx: any) {
//     for (const issue of issues.filter((i) => !i.resolved)) {
//       await this.apply(issue, ctx);
//     }
//     return issues.filter((i) => !i.resolved);
//   }
//   public async assfactory(
//     input: RemedyAssFactoryInput,
//     ctx: any,
//   ): Promise<any[]> {
//     // TODO: rebuild
//     const { asserter, entity, processors, maxIterations = 10 } = input;
//     let allIssues: any[] = [];
//     let iteration = 0;

//     while (iteration < maxIterations) {
//       iteration++;

//       const issues = await asserter(entity, processors);

//       if (issues.length === 0) {
//         return [];
//       }

//       let unresolvedIssues = [];

//       for (let issue of issues) {
//         if (allIssues.find((slug) => slug === issue.slug)) {
//           issue.markError({
//             message: `Repetition detected: ${iteration} ${issue.slug}`,
//           });
//           unresolvedIssues.push(issue);
//           break;
//         }

//         allIssues.push(issue.slug);
//         issue.history = [...allIssues];

//         await this.apply(issue, ctx);

//         if (!issue.resolved) {
//           unresolvedIssues.push(issue);
//         }
//       }

//       if (unresolvedIssues.length > 0) {
//         return unresolvedIssues;
//       }
//     }

//     const finalIssues = await asserter(entity, processors);

//     for (const issue of finalIssues) {
//       issue.markError({ message: "Irresolvable" });
//     }

//     return finalIssues;
//   }
// }
