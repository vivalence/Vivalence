export class ProcessEntity {
  constructor(manifest, pid, osClient) {
    this.manifest = manifest;
    this.pid = pid;
    this.os = osClient;
    this.startedAt = new Date();
  }

  async status() {
    try {
      // Try to get process info from OS
      const processes = await this.os.list();
      const process = processes.find((p) => p.pid === this.pid);

      return {
        alive: !!process,
        pid: this.pid,
        cpu: process?.cpu || 0,
        memory: process?.memory || 0,
        uptime: Date.now() - this.startedAt.getTime(),
        status: process?.status || "unknown",
      };
    } catch (error) {
      return { alive: false, pid: this.pid, error: error.message };
    }
  }

  async isHealthy() {
    const status = await this.status();
    if (!status.alive) return false;

    const healthcheck = this.manifest.lifecycle?.control?.healthcheck;
    if (!healthcheck) return true;

    try {
      const response = await fetch(
        `http://localhost:${this.manifest.port || 5173}${healthcheck.path}`,
        { signal: AbortSignal.timeout(5000) },
      );
      return response.ok;
    } catch {
      return false;
    }
  }

  async kill() {
    const options = this.manifest.lifecycle?.shutdown || {};
    return await this.os.kill(this.pid, options);
  }

  async restart() {
    await this.kill();
    // Manager should handle respawning
  }
}
