import { validators, object } from "@vivalence/shared";

export async function constraints(daemonDie) {
  createAnnotationConstraints(daemonDie.good);
  createLiteralConstraints(daemonDie.good);
  createSymbolConstraints(daemonDie.good);
  createExistentialConstraints(daemonDie.good);

  const subjects = await daemonDie.good.entities.subject.find({});

  for (const subject of subjects) {
    createSubjectSchematicConstraints(subject, daemonDie.good);

    if (subject.relations) {
      createSubjectRelationalConstraints(subject, daemonDie.good);
      createAnnotationRelationalConstraints(subject, daemonDie.good);
    }
  }
}

function createAnnotationConstraints(daemon) {
  let baseValidator = null;

  daemon.kernel.constraint.create({
    branch: ["annotation"],
    traits: ["SCHEMATIC"],
    description: "Base annotation schema validation",
    predicate: async (annotation) => {
      if (!baseValidator) {
        baseValidator = validators.viva.precompiled(daemon.schema.annotation);
      }
      const issues = await baseValidator(annotation);
      return issues.map((issue) => ({
        ...issue,
        path: ["annotation", ...issue.path],
        context: { annotation },
      }));
    },
  });
}

function createSubjectSchematicConstraints(subject, daemon) {
  const schema = daemon.schema.annotations[subject.slug];
  if (!schema) return;

  let validator = null;

  daemon.kernel.constraint.create({
    branch: ["annotation", subject.slug],
    traits: ["SCHEMATIC"],
    description: `Annotation schema for ${subject.slug}`,
    predicate: async (annotation) => {
      if (!validator) {
        validator = validators.viva.precompiled(schema);
      }
      const issues = await validator(annotation);
      return issues.map((issue) => ({
        ...issue,
        path: ["annotation", ...issue.path],
        context: { annotation, subject: subject.slug },
      }));
    },
  });

  const literalSchema = daemon.schema.literals[subject.slug];
  if (!literalSchema) return;

  let literalValidator = null;

  daemon.kernel.constraint.create({
    branch: ["literal", subject.slug],
    traits: ["SCHEMATIC"],
    description: `Literal schema for ${subject.slug}`,
    predicate: async (literal) => {
      if (!literalValidator) {
        literalValidator = validators.viva.precompiled(literalSchema);
      }
      const issues = await literalValidator(literal);
      return issues.map((issue) => ({
        ...issue,
        path: ["literal", ...issue.path],
        context: { literal, subject: subject.slug },
      }));
    },
  });
}

function createSubjectRelationalConstraints(subject, daemon) {
  daemon.kernel.constraint.create({
    branch: ["literal", subject.slug],
    traits: ["RELATIONAL"],
    description: `Relational constraints for ${subject.slug}`,
    predicate: async (literal) => {
      if (!literal.symbols?.isInitialized?.()) {
        await literal.symbols?.init?.();
      }

      const relations = (literal.symbols?.getItems?.() || [])
        .map((symbol) => symbol.data?.ONTOLOGICAL)
        .filter(Boolean);

      const issues = [];

      for (const relation of subject.relations) {
        const relationIssues = validators.viva.relations(relation, relations);
        relationIssues.forEach((issue) => {
          issue.path = ["literal", "symbols"];
          if (!issue.context.relation) issue.context.relation = relation;
          issue.context.literal = literal;
          issues.push(issue);
        });
      }

      return issues;
    },
  });
}

function createLiteralConstraints(daemon) {
  let baseValidator = null;

  daemon.kernel.constraint.create({
    branch: ["literal"],
    traits: ["SCHEMATIC"],
    description: "Base literal schema validation",
    predicate: async (literal) => {
      if (!baseValidator) {
        baseValidator = validators.viva.precompiled(daemon.schema.literal);
      }
      const issues = await baseValidator(literal);
      return issues.map((issue) => ({
        ...issue,
        path: ["literal", ...issue.path],
        context: { literal },
      }));
    },
  });
}

function createSymbolConstraints(daemon) {
  const symbolSchema = {
    type: "object",
    properties: {
      slug: { type: "string" },
      traits: { type: "array", items: { type: "string" } },
      data: { type: "object" },
    },
    required: ["slug"],
    additionalProperties: true,
  };

  let validator = null;

  daemon.kernel.constraint.create({
    branch: ["symbol"],
    traits: ["SCHEMATIC"],
    description: "Symbol schema validation",
    predicate: async (symbol) => {
      if (!validator) {
        validator = validators.viva.precompiled(symbolSchema);
      }
      const issues = await validator(symbol);
      return issues.map((issue) => ({
        ...issue,
        path: ["symbol", ...issue.path],
        context: { symbol },
      }));
    },
  });
}

function createExistentialConstraints(daemon) {
  daemon.kernel.constraint.create({
    branch: ["symbol"],
    traits: ["EXISTENTIAL"],
    description: "Check symbol exists in database",
    predicate: async (symbol) => {
      const query = {};
      if (symbol.slug) query.slug = symbol.slug;
      else if (symbol.data?.ONTOLOGICAL)
        query.data = { ONTOLOGICAL: symbol.data.ONTOLOGICAL };
      else throw new Error("symbol requires slug for existential constraint");

      // console.json({ symbol, query });
      const count = await daemon.entities.symbol.count(query);
      if (count > 0) return [];
      return [
        {
          message: "Symbol not found",
          violation: "required",
          path: ["symbol"],
          context: { symbol },
        },
      ];
    },
  });

  daemon.kernel.constraint.create({
    branch: ["literal"],
    traits: ["EXISTENTIAL"],
    description: "Check literal exists in database",
    predicate: async (literal) => {
      const query = {};
      if (literal.slug) query.slug = literal.slug;
      if (literal.annotation) query.annotation = literal.annotation;
      const count = await daemon.entities.literal.count(query);
      if (count > 0) return [];
      return [
        {
          message: "Literal not found",
          violation: "required",
          path: ["literal"],
          context: { literal },
        },
      ];
    },
  });

  daemon.kernel.constraint.create({
    branch: ["annotation"],
    traits: ["EXISTENTIAL"],
    description: "Check annotation has corresponding literal and symbols",
    predicate: async (annotation) => {
      const issues = [];

      // Check literal exists
      const literalCount = await daemon.entities.literal.count({ annotation });
      if (literalCount < 1) {
        issues.push({
          message: "Literal missing for annotation",
          violation: "required",
          path: ["literal"],
          context: { literal: { annotation } },
        });
      }

      // Check symbols exist for each dimension:value pair
      for (const [branch, leaf] of Object.entries(annotation)) {
        const symbolQuery = {
          data: { ONTOLOGICAL: { branch, leaf } },
        };
        const symbolCount = await daemon.entities.symbol.count(symbolQuery);

        if (symbolCount < 1) {
          issues.push({
            message: `Symbol missing for ${branch}:${leaf}`,
            violation: "required",
            path: ["symbol", branch],
            context: { annotation, branch, leaf },
          });
        }
      }

      return issues;
    },
  });
}

function createAnnotationRelationalConstraints(subject, daemon) {
  daemon.kernel.constraint.create({
    branch: ["annotation", subject.slug],
    traits: ["RELATIONAL"],
    description: `Relational constraints for ${subject.slug} annotation`,
    predicate: async (annotation) => {
      const literal = await daemon.entities.literal.findOne(
        { annotation },
        {
          populate: ["symbols"],
        },
      );

      if (!literal) {
        return [
          {
            message: "Cannot validate relations - literal not found",
            violation: "required",
            path: ["literal"],
            context: { annotation, subject: subject.slug },
          },
        ];
      }

      const relations = (literal.symbols?.getItems?.() || [])
        .map((symbol) => symbol.data?.ONTOLOGICAL)
        .filter(Boolean);

      const issues = [];

      for (const relation of subject.relations || []) {
        const relationIssues = validators.viva.relations(relation, relations);
        relationIssues.forEach((issue) => {
          issue.message = "[EXPERIMENTAL] Cannot validate relations";
          issue.violation = "required";
          issue.path = ["literal", "symbols"];
          issue.context = {
            annotation,
            literal,
            relation,
            subject: subject.slug,
          };
          issues.push(issue);
        });
      }

      return issues;
    },
  });
}
