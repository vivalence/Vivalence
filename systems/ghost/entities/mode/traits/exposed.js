import { shape } from "@vivalence/typology";

export const EXPOSED = async (mode) => {
  mode.metadata.aperture = await mode.connection.call("/metadata/aperture");
  mode.call = shape.connection.wire(mode.connection, mode.metadata.aperture);
};
