import { RemoteRepository } from "@vivalence/typology";
import { Thread } from "./prototype.js";

export const repository = (dataspace) => new RemoteRepository(Thread).connect(dataspace.runtime.connection.branch("/userspace/entities/thread"));
