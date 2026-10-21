import { RemoteRepository } from "@vivalence/typology";
import { Mode } from "./prototype.js";

export const repository = (dataspace) => new RemoteRepository(Mode).connect(dataspace.runtime.connection.branch(`${dataspace.runtime.reference.absolute}/entities/mode`));
