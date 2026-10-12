import { Bundle } from "@vivalence/typology";

export const APPLICATION = async (mode) => {
  const record = await mode.connection.call("/metadata/application");
  mode.application = {
    url: record.url,
    schema: record.schema,
    bundle: new Bundle(record.bundle).withUrl(record.url),
  };
};

