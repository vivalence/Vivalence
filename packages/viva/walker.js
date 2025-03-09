export default class Walker {
  async execute(result, currentPath, ctx) {
    if (result.handled) {
      if (result.result) {
        console.log(
          "Result:",
          typeof result.result === "object"
            ? JSON.stringify(result.result, null, 2)
            : result.result,
        );
      }

      if (ctx.buffer) {
        const textDecoder = new TextDecoder();
        console.log(textDecoder.decode(ctx.buffer));
      }
    } else {
      console.log("No handler at this path");
    }

    if (!result.paths || result.paths.length === 0) {
      console.log("No paths available");
      return { complete: true };
    }

    const signal = await this.renderer.render(result, currentPath);

    if (signal === "exit") {
      return { complete: true };
    }

    const newCtx = this.createContext();

    // Optionally preserve state from previous context
    if (ctx.state && Object.keys(ctx.state).length > 0) {
      newCtx.state = { ...ctx.state };
    }

    const nextResult = await this.trajectory.traverse(signal, newCtx);

    return this.execute(nextResult, signal, newCtx);
  }
}
