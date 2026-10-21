import { ValidationError } from "@vivalence/typology";

export const cast = (schema, signal) => {
  const positional = Object.keys(schema.properties)
    .map((key, index) => [key, signal.body[index]])
    .filter(([, datum]) => datum !== undefined);
  const input = schema.cast({ ...Object.fromEntries(positional), ...signal.flags });
  const errors = [...schema.errors(input)];
  if (errors.length) throw new ValidationError(errors, signal);
  return input;
};
