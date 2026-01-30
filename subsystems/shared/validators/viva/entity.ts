import { makeAjv } from "../ajv.js";
import { JsonSchema, Issue, AjvValidationError } from "./types.d.ts";

export function precompiled(schema: JsonSchema) {
  return compile(schema);
}

export function direct(schema: JsonSchema, entity: any): Issue[] {
  const validate = compile(schema);
  return validate(entity);
}

function compile(schema) {
  const ajv = makeAjv({ removeAdditional: false }); // was true. not sure it matters. changed because it strips entities.
  const validate = ajv.compile(schema);

  return (entity: any) => {
    if (!validate(entity)) return buildIssues(entity, validate);
    else return [];
  };
}

function buildIssues(entity, validate) {
  const issues = [];
  validate.errors
    .filter((error: AjvValidationError) => error.keyword !== "if")
    .forEach((error: AjvValidationError) => {
      issues.push(buildIssue(entity, error));
    });
  return issues;
}

function buildIssue(entity: any, error: AjvValidationError): Issue {
  const path = [...error.instancePath.split("/").filter((p: any) => p !== "")];
  const context = { error, entity };

  if (error.keyword === "enum") {
    return {
      message: `Invalid value: Expected one of the allowed values`,
      violation: "invalid",
      path,
      context,
    };
  } else if (error.keyword === "required") {
    return {
      message: `Missing required property: "${error.params.missingProperty}"`,
      violation: "required",
      path: [...path, error.params.missingProperty],
      context,
    };
  } else if (error.keyword === "not") {
    return {
      message: `Forbidden value at ${error.instancePath}`,
      violation: "forbidden",
      path,
      context,
    };
  } else if (error.keyword === "additionalProperties") {
    return {
      message: `Unexpected property: "${error.params.additionalProperty}"`,
      violation: "forbidden",
      path: [...path, error.params.additionalProperty],
      context,
    };
    // } else if (error.keyword === "if") {
    //   return {
    //     message: `Conditional validation failed at ${error.instancePath}`,
    //     violation: "conditional",
    //     path,
    //     context,
    //   };
  }

  return {
    message: `Validation error: ${error.message}`,
    path,
    violation: "invalid",
    context,
  };
}
