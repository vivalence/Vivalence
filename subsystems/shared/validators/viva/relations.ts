import {
  Relation,
  Constraint,
  RequiredConstraint,
  UniqueConstraint,
  ForbiddenConstraint,
  SomeConstraint,
  ConditionConstraint,
  Issue,
} from "./types.d.ts";

export default function validateRelations(
  constraint: Constraint,
  relations: Relation[],
): Issue[] {
  if ("required" in constraint) {
    return required(constraint, relations);
  } else if ("unique" in constraint) {
    return unique(constraint, relations);
  } else if ("forbidden" in constraint) {
    return forbidden(constraint, relations);
  } else if ("some" in constraint) {
    return oneOf(constraint, relations);
  } else if ("condition" in constraint) {
    return conditional(constraint, relations);
  } else {
    throw new Error(
      `[UNKNOWN RELATION CONSTRAINT]: ${JSON.stringify(constraint)}`,
    );
  }
}

function required(
  constraint: RequiredConstraint,
  relations: Relation[],
): Issue[] {
  const issues: Issue[] = [];
  const { branch, leaf } = constraint.required;
  const required = filterRelations(relations, branch, leaf);

  if (required.length < 1) {
    issues.push({
      message: `Missing required relation [${formatRelationRef(branch, leaf)}]`,
      path: [],
      violation: "required",
      context: { constraint, required, relations },
    });
  }

  return issues;
}

function unique(constraint: UniqueConstraint, relations: Relation[]): Issue[] {
  // console.log(constraint, relations);
  const issues: Issue[] = [];
  const { branch, leaf } = constraint.unique;
  const unique = filterRelations(relations, branch, leaf);

  if (unique.length > 1) {
    issues.push({
      message: `Duplicate relation detected [${formatRelationRef(branch, leaf)}]`,
      path: [],
      violation: "unique",
      context: { constraint, unique, relations },
    });
  }

  return issues;
}

function forbidden(
  constraint: ForbiddenConstraint,
  relations: Relation[],
): Issue[] {
  const issues: Issue[] = [];
  const { branch, leaf } = constraint.forbidden;
  const forbidden = filterRelations(relations, branch, leaf);

  if (forbidden.length > 0) {
    issues.push({
      message: `Forbidden relation found [${formatRelationRef(branch, leaf)}]`,
      path: [],
      violation: "forbidden",
      context: { constraint, forbidden, relations },
    });
  }

  return issues;
}

function oneOf(constraint: SomeConstraint, relations: Relation[]): Issue[] {
  const issues: Issue[] = [];

  const tests = constraint.some.map((c) => {
    const testIssues = validateRelations(c, relations);
    return testIssues.map((error) => {
      error.context.ancestor = error.context.ancestor
        ? [...error.context.ancestor, constraint]
        : [constraint];
      return error;
    });
  });

  if (tests.every((e) => e.length > 0)) {
    tests.forEach((e) => issues.push(...e));
  }

  return issues;
}

function conditional(
  constraint: ConditionConstraint,
  relations: Relation[],
): Issue[] {
  const issues: Issue[] = [];

  const conditionIssues = validateRelations(constraint.condition.if, relations);
  const conditionMet = conditionIssues.length === 0;

  const constraintToValidate = conditionMet
    ? constraint.condition.then
    : constraint.condition.else;

  if (constraintToValidate) {
    for (const c of constraintToValidate) {
      const nestedIssues = validateRelations(c, relations);
      nestedIssues.forEach((error) => {
        error.context.ancestor = error.context.ancestor
          ? [...error.context.ancestor, constraint]
          : [constraint];
        issues.push(error);
      });
    }
  }

  return issues;
}

function formatRelationRef(branch?: string, leaf?: string): string {
  const branchText = branch ? `branch: "${branch}"` : "any branch";
  const leafText = leaf ? `leaf: "${leaf}"` : "any leaf";
  return `${branchText}, ${leafText}`;
}

function filterRelations(
  relations: Relation[],
  branch?: string,
  leaf?: string,
): Relation[] {
  return relations.filter(
    (relation) =>
      (!branch || relation.branch === branch) &&
      (!leaf || relation.leaf === leaf),
  );
}
