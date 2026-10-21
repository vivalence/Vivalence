import { RemoteRepository } from "@vivalence/typology";
import { Turn } from "./prototype.js";

export const repository = (dataspace) => new RemoteRepository(Turn).connect(dataspace.runtime.connection.branch("/userspace/entities/turn"));
