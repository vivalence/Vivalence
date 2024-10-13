import jsonata from "jsonata";

export default async (rule, data) => {
  const expression = jsonata(rule);
  const result = await expression.evaluate(data);
  return result;
};
