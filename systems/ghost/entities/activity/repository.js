import { RemoteRepository } from "@vivalence/typology";
import { Activity } from "./prototype.js";

export const repository = (dataspace) => new RemoteRepository(Activity).connect(dataspace.runtime.connection.branch("/userspace/entities/activity"));
