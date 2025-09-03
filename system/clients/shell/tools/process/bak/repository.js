export class OSProcessClient {
  async spawn(manifest, config) {
    console.log({ manifest, config });
    const command = new Deno.Command(config.cmd[0], {
      args: config.cmd.slice(1),
      cwd: config.cwd || ".",
      env: {
        ...config.env,
        VIVA_PROCESS_SLUG: manifest.slug,
      },
      stdout: config?.detached ? "piped" : "inherit",
      stderr: config?.detached ? "piped" : "inherit",
    });
    console.log({ command });

    const child = command.spawn();
    console.log({ child });
    // const entity = new ProcessEntity(manifest, child.pid, this);

    // return entity;
  }

  // async kill(pid, options = {}) {
  //   const { graceful = true, timeout = 5000 } = options;

  //   try {
  //     if (graceful) {
  //       Deno.kill(pid, "SIGTERM");

  //       // Wait for graceful shutdown
  //       await new Promise((resolve) => setTimeout(resolve, timeout));

  //       // Check if still alive
  //       const processes = await this.list();
  //       const stillAlive = processes.find((p) => p.pid === pid);

  //       if (stillAlive) {
  //         Deno.kill(pid, "SIGKILL");
  //       }
  //     } else {
  //       Deno.kill(pid, "SIGKILL");
  //     }
  //   } catch (error) {
  //     // Process might already be dead
  //     if (!error.message.includes("No such process")) {
  //       throw error;
  //     }
  //   }
  // }

  async list() {
    const cmd = new Deno.Command("ps", {
      args: ["aux"],
      stdout: "piped",
    });
    const { stdout } = await cmd.output();
    const output = new TextDecoder().decode(stdout);

    return output
      .split("\n")
      .slice(1) // Skip header
      .filter(Boolean)
      .map((line) => {
        const parts = line.trim().split(/\s+/);
        return {
          user: parts[0],
          pid: parseInt(parts[1]),
          cpu: parseFloat(parts[2]),
          memory: parseFloat(parts[3]),
          status: parts[7],
          command: parts.slice(10).join(" "),
          env: {}, // Would need separate call to get env
        };
      });
  }

  async find({ slug, pid }) {
    console.log("find", { slug, pid });
    const list = await this.list();
    console.log(list);
    //   const processes = await this.list();

    //   if (pid) {
    //     const process = processes.find((p) => p.pid === pid);
    //     return process ? new ProcessEntity({ slug }, pid, this) : null;
    //   }

    //   if (slug) {
    //     // This is simplified - in reality we'd need to check env vars
    //     const process = processes.find(
    //       (p) =>
    //         p.command.includes(slug) ||
    //         p.command.includes(`VIVA_PROCESS_SLUG=${slug}`),
    //     );
    //     return process ? new ProcessEntity({ slug }, process.pid, this) : null;
    //   }

    return null;
  }
}
