import { RemoteRepository } from "@vivalence/typology";
import { Terminal } from "./prototype.js";

export const repository = (dataspace) => new RemoteRepository(Terminal).connect(dataspace.runtime.connection.branch("/userspace/entities/terminal"));
