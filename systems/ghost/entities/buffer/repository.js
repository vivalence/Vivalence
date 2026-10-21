import { RemoteRepository } from "@vivalence/typology";
import { Buffer } from "./prototype.js";

export const repository = (dataspace) =>
  new RemoteRepository(Buffer).connect(
    dataspace.runtime.connection.branch("/userspace/entities/buffer"),
  );
