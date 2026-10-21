import { RemoteRepository } from "@vivalence/typology";
import { Note } from "./prototype.js";

export const repository = () => new RemoteRepository(Note);
