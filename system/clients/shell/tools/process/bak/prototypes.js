export class ProcessEntity {
  constructor(manifest, pid, osClient) {
    this.manifest = manifest;
    this.pid = pid;
    this.os = osClient;
    this.process = null;
  }

  async status() {
    return await this.os.getProcessStatus(this.pid);
  }

  async logs() {
    return await this.os.getProcessLogs(this.pid);
  }

  async kill() {
    // const graceful = this.manifest.lifecycle?.shutdown?.graceful;
    // const timeout = this.manifest.lifecycle?.shutdown?.timeout || 5000;
    return await this.os.kill(this.pid, this.manifest.lifecycle?.shutdown);
  }

  // async isHealthy() {
  //   const status = await this.status();
  //   if (!status.alive) return false;

  //   const healthcheck = this.manifest.lifecycle?.control?.healthcheck;
  //   if (!healthcheck) return true;

  //   try {
  //     const response = await fetch(`http://localhost:${this.manifest.port || 5173}${healthcheck.path}`);
  //     return response.ok;
  //   } catch {
  //     return false;
  //   }
  // }

  // watch(callback) {
  //   return this.os.watchProcess(this.pid, callback);
  // }
}

export class OSProcessClient {
  async list() {
    //
    // read from system. os.
    //
  }
  async find({ slug, pid }) {
    const processes = await this.list();
    return processes.find(
      (p) => p.env.VIVA_PROCESS_SLUG === slug || p.pid === pid,
    );
  }

  async spawn(manifest, config) {
    const command = new Deno.Command(config.cmd[0], {
      args: config.cmd.slice(1),
      cwd: config.cwd || ".",
      env: { ...Deno.env.toObject(), ...config.env },
      stdout: config.detached ? "piped" : "inherit",
      stderr: config.detached ? "piped" : "inherit",
    });
    // const child = command.spawn();

    // const entity = new ProcessEntity(manifest, child.pid, this);

    // return entity;
  }

  async kill(pid, options = {}) {
    // const { graceful = true, timeout = 5000 } = options;

    Deno.kill(pid, "SIGTERM");
    Deno.kill(pid, "SIGKILL");
  }
}

// export class ProcessEntity {
//   constructor(manifest, pid, osClient) {
//     this.manifest = manifest;
//     this.pid = pid;
//     this.os = osClient;
//   }

//   async status() {
//     // return await this.os.getProcessStatus(this.pid);
//   }

//   async logs() {
//     // return await this.os.getProcessLogs(this.pid);
//   }

//   async kill() {
//     // await this.os.kill(this.pid, this.manifest.lifecycle?.shutdown);
//   }

//   watch(callback) {
//     // return this.os.watchProcess(this.pid, callback);
//   }
// }
// // { // spawn input
// //   config: {
// //     cmd: [ "npm", "run", "dev" ],
// //     cwd: "/Users/finn/vivalence/code/vivalence/system/clients/web",
// //     env: {
// //       NODE_ENV: "development",
// //       VITE_DAEMON_URL: "http://localhost:5175"
// //     }
// //   },
// //   manifest: {
// //     type: "client",
// //     slug: "web",
// //     description: "sveltekit client for local, web and bundled.",
// //     lifecycle: {
// //       startup: { timeout: 30000 },
// //       constraints: { env: { requires: [] } },
// //       control: {
// //         healthcheck: { path: "/healthcheck" },
// //         status: { url: "http://localhost:5173/status", path: "/status" }
// //       },
// //       shutdown: { graceful: true, timeout: 10000 }
// //     }
// //   }
// // }
// export class OSProcessClient {
//   // async find({ slug, pid }) {const processes = await this.listProcesses(); return processes.find((p) => p.env.VIVA_PROCESS_SLUG === slug || p.pid === pid,);}

//   async spawn(manifest, config) {
//     //   const child = new Deno.Command(manifest.cmd[0], {
//     //     args: manifest.cmd.slice(1),
//     //     cwd: manifest.cwd || ".",
//     //     env: manifest.env,
//     //     stdout: manifest.detached ? "piped" : "inherit",
//     //     stderr: manifest.detached ? "piped" : "inherit",
//     //   }).spawn();
//     //   return new ProcessEntity(manifest, child.pid, this);
//   }
// }
