import { RemoteRepository } from "@vivalence/typology";
import { File } from "./prototype.js";

export const repository = (dataspace) => new RemoteRepository(File).connect(dataspace.runtime.connection.branch("/userspace/entities/file"));
