import { View } from "@vivalence/typology";

export const APPLICATION = async (mode) => {
  const record = await mode.connection.call("/metadata/app");
  mode.app = {
    url: record.url,
    schema: record.schema,
    view: new View(record.view).withUrl(record.url),
  };
};

export const GENERATIVE = () => {};
