import { RemoteRepository } from "@vivalence/typology";
import { Daemon } from "./prototype.js";

export const repository = (dataspace) => new RemoteRepository(Daemon).connect(dataspace.runtime.connection.branch(`${dataspace.runtime.reference.absolute}/entities/daemon`));
