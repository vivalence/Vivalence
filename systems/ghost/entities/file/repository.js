import { RemoteRepository } from "@vivalence/typology";
import { File } from "./prototype.js";

export class FileRepository extends RemoteRepository {
  async *upload({ path, mime, body, ...holders }) {
    const seat = path.split("/").map(encodeURIComponent).join("/");
    const packets = this.connection.stream(`/upload/${seat}`, undefined, {
      method: "POST",
      headers: { "content-type": mime },
      raw: { body },
      query: holders,
    });
    for await (const packet of packets)
      yield packet.event === "/file" ? { ...packet, file: await this.merge(packet.file) } : packet;
  }

  async paste(data) {
    return await this.merge(await this.connection.call("/paste", data));
  }
}

export const repository = (dataspace) => new FileRepository(File).connect(dataspace.runtime.connection.branch("/userspace/entities/file"));
