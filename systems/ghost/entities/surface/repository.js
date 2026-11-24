import { RemoteRepository } from "@vivalence/typology";
import { Surface } from "./prototype.js";

export const repository = (dataspace) => new RemoteRepository(Surface).connect(dataspace.runtime.connection.branch("/userspace/entities/surface"));
