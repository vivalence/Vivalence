import { RemoteRepository } from "@vivalence/typology";
import { View } from "./prototype.js";

export const repository = (dataspace) => new RemoteRepository(View).connect(dataspace.runtime.connection.branch("/userspace/entities/view"));
