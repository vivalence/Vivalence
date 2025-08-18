export interface Issue {
  message: string;
  violation: string;
  path: string[];
  context: {
    [key: string]: any;
  };
}

export interface Relation {
  branch: string;
  leaf: string;
}

export interface RequiredConstraint {
  required: {
    branch?: string;
    leaf?: string;
  };
}

export interface UniqueConstraint {
  unique: {
    branch?: string;
    leaf?: string;
  };
}

export interface ForbiddenConstraint {
  forbidden: {
    branch?: string;
    leaf?: string;
  };
}

export interface SomeConstraint {
  some: Constraint[];
}

export interface ConditionConstraint {
  condition: {
    if: Constraint;
    then?: Constraint[];
    else?: Constraint[];
  };
}

export type Constraint =
  | RequiredConstraint
  | UniqueConstraint
  | ForbiddenConstraint
  | SomeConstraint
  | ConditionConstraint;

// Schema validation types
export interface JsonSchema {
  [key: string]: any;
}

export interface AjvValidationError {
  keyword: string;
  instancePath: string;
  schemaPath: string;
  params: {
    missingProperty?: string;
    additionalProperty?: string;
    [key: string]: any;
  };
  message: string;
}
