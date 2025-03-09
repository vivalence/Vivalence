export default class Trajectory {
  constructor(path = "/") {
    this.path = path;
    this.handlers = new Map();
    this.branches = new Map();
    this.middlewares = [];
  }

  open(path, handler) {
    this.handlers.set(path, handler);
    return this;
  }

  branch(path) {
    if (!this.branches.has(path)) {
      this.branches.set(path, new Trajectory(path));
    }
    return this.branches.get(path);
  }

  use(middleware) {
    this.middlewares.push(middleware);
    return this;
  }

  getAvailablePaths() {
    return [...Array.from(this.handlers.keys()), ...Array.from(this.branches.keys())];
  }

  async traverse(path, ctx) {
    if (this.handlers.has(path)) {
      await this._applyMiddlewares(ctx);

      const result = await this.handlers.get(path)(ctx);

      return {
        handled: true,
        result,
        paths: this.getAvailablePaths(),
        currentPath: this.path,
      };
    }

    for (const [branchPath, branch] of this.branches) {
      if (path === branchPath) {
        await this._applyMiddlewares(ctx);

        return {
          handled: false,
          paths: branch.getAvailablePaths().map((p) => `${branchPath}${p === "/" ? "" : "/" + p}`),
          currentPath: branchPath,
        };
      }

      if (path.startsWith(branchPath + "/")) {
        await this._applyMiddlewares(ctx);

        const subPath = path.substring(branchPath.length) || "/";
        const branchResult = await branch.traverse(subPath, ctx);

        if (branchResult.paths) {
          branchResult.paths = branchResult.paths.map((p) =>
            p.startsWith("/") ? `${branchPath}${p}` : `${branchPath}/${p}`,
          );
        }

        return branchResult;
      }
    }

    return {
      handled: false,
      paths: this.getAvailablePaths(),
      currentPath: this.path,
    };
  }

  async _applyMiddlewares(ctx) {
    let index = 0;

    const next = async () => {
      if (index < this.middlewares.length) {
        const middleware = this.middlewares[index++];
        return await middleware(ctx, next);
      }
    };

    await next();
  }
}
