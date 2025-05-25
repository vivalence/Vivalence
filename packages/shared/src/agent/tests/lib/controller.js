import { Agentic } from "@vivalence/shared/trajectory";

// TODO move to /agent
export class MockController extends Agentic {
  trace = [];

  constructor(trajectory) {
    super(trajectory);
  }

  get tracedTools() {
    return Object.entries(this.tools).reduce((tools, [name, tool]) => {
      tools[name] = {
        ...tool,
        execute: async (input) => {
          this.trace.push({ name, input });
          return await tool.execute(input);
        },
      };

      return tools;
    }, {});
  }
}

export function createController(trajectory) {
  return new MockController(trajectory);
}
