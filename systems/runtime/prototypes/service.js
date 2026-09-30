import { Aperture } from "@vivalence/typology";
import { VirtualSchema } from "@vivalence/typology/entities";
import { ProcessEntity, ProcessRepository, ProcessSchema } from "../entities/index.ts";

export class Service extends ProcessEntity {
  type = "service";
  aperture = new Aperture();
}

export const ServiceSchema = new VirtualSchema({ class: Service, extends: ProcessSchema, repository: () => ProcessRepository, properties: {} });
