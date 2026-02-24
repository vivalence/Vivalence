import { object } from "@vivalence/shared";

export async function schema(daemonDie) {
  const daemon = daemonDie.good;

  daemon.schema.annotation = await buildBaseAnnotation(daemon);

  daemon.schema.literal = buildBaseLiteral();
  daemon.schema.annotations = {};
  daemon.schema.literals = {};

  const subjects = await daemon.entities.subject.find({});

  for (const subject of subjects) {
    const annotation = await buildSubjectAnnotation(subject, daemon);
    daemon.schema.annotations[subject.slug] = annotation;
    daemon.schema.literals[subject.slug] = buildSubjectLiteral(
      subject,
      annotation,
      daemon.schema.literal,
    );
  }
}

// --- base ---

async function buildBaseAnnotation(daemon) {
  const schema = emptyObject("Annotation", "Base annotation schema");

  const dimensions = await daemon.entities.dimension.find({ ancestor: null });

  for (const dim of dimensions) {
    await dim.descendants.init();
    schema.properties[dim.slug] = dimensionProperty(dim);
  }

  return schema;
}

function buildBaseLiteral() {
  return {
    type: "object",
    title: "Literal",
    description: "Base literal schema",
    properties: {
      slug: { type: "string" },
      annotation: { type: "object" },
      data: { type: "object", description: "keyed by trait" },
    },
    required: ["slug", "annotation", "data"],
    additionalProperties: false,
  };
}

// --- per-subject ---

async function buildSubjectAnnotation(subject, daemon) {
  const schema = emptyObject(subject.name || subject.slug, subject.description || "");

  const allOf = [];

  for (const rule of subject.dimensions || []) {
    if (rule.branch) await applyBranch(schema, rule, daemon);
    else if (rule.condition) allOf.push(rule.condition);
  }

  if (allOf.length) schema.allOf = allOf;

  return schema;
}

function buildSubjectLiteral(subject, annotationSchema, base) {
  return object.merge(base, {
    title: `${subject.name || subject.slug} Literal`,
    description: subject.description || "",
    properties: { annotation: annotationSchema },
    additionalProperties: false,
  });
}

// --- helpers ---

async function applyBranch(schema, rule, daemon) {
  const [slug, ...leafSpec] = rule.branch;

  const dim = await daemon.entities.dimension.findOne({
    slug,
    ancestor: null,
  });

  if (!dim) return console.warn(`[schema] dimension not found: ${slug}`);

  await dim.descendants.init();

  const prop = dimensionProperty(dim);

  if (leafSpec.length) {
    const leaf = leafSpec[0];
    if (Array.isArray(leaf)) prop.enum = leaf;
    else if (typeof leaf === "string" && leaf !== "*") prop.const = leaf;
  }

  schema.properties[slug] = prop;
  if (rule.required) schema.required.push(slug);
}

function dimensionProperty(dim) {
  const prop = {
    type: "string",
    title: dim.name || dim.slug,
    description: dim.description || "",
  };

  if (dim.traits.includes("TOPOGRAPHICAL")) {
    prop.description += " [topographical]";
  }

  if (dim.traits.includes("CATEGORICAL")) {
    const items = dim.descendants.getItems();
    prop.enum = items.map((d) => d.slug);
    prop.description += ` [${items.map((d) => `${d.slug}: ${d.description || d.name || ""}`).join(", ")}]`;
  }

  return prop;
}

function emptyObject(title, description) {
  return {
    type: "object",
    title,
    description,
    properties: {},
    required: [],
    additionalProperties: false,
  };
}

// import { validators, object } from "@vivalence/shared";

// export async function schema(daemonDie) {
//   daemonDie.good.schema.annotation = baseAnnotationSchema();
//   daemonDie.good.schema.annotations = {};
//   daemonDie.good.schema.literal = baseLiteralSchema(
//     daemonDie.kernel.domain.topography.schematics.literal,
//   );
//   daemonDie.good.schema.literals = {};

//   const dimensions = await daemonDie.good.entities.dimension //
//     .find({ ancestor: null });

//   for (const dimension of dimensions) {
//     await dimension.descendants.init();
//     applyDimensionToBase(daemonDie.good.schema.annotation, dimension);
//   }

//   const subjects = await daemonDie.good.entities.subject.find({});

//   for (const subject of subjects) {
//     const annotationSchema = await buildSubjectAnnotationSchema(subject, daemonDie.good);
//     daemonDie.good.schema.annotations[subject.slug] = annotationSchema;

//     const literalSchema = buildSubjectLiteralSchema(
//       subject,
//       annotationSchema,
//       daemonDie.good.schema.literal,
//     );
//     daemonDie.good.schema.literals[subject.slug] = literalSchema;
//   }
// }

// function applyDimensionToBase(schema, dimension) {
// const dimSchema = {
//   type: "string",
//   title: dimension.name || dimension.slug,
//   description: dimension.description || "",
// };

// if (dimension.traits.includes("TOPOGRAPHICAL")) {
//   dimSchema.description += " [TOPOGRAPHICAL: functions as primary key]";
// }

// if (dimension.traits.includes("CATEGORICAL")) {
//   const categories = dimension.descendants.getItems();

//   dimSchema.enum = categories.map(({ slug }) => slug);
//   dimSchema.description += ` Values: [${categories
//     .map(({ slug, name = "", description = "" }) => `${slug} (${name}: ${description})`)
//     .join(", ")}]`;
// }

// schema.properties[dimension.slug] = dimSchema; //
// }

// async function buildSubjectAnnotationSchema(subject, daemon) {
// const schema = {
//   type: "object",
//   title: subject.name || subject.slug,
//   description: subject.description || "",
//   properties: {},
//   required: [],
//   allOf: [],
//   additionalProperties: false,
// };

// for (const rule of subject.dimensions || []) {
//   if (rule.branch) {
//     await applyBranchRule(schema, rule, daemon);
//   } else if (rule.condition) {
//     schema.allOf.push(rule.condition);
//   }
// }

// if (schema.allOf.length === 0) {
//   delete schema.allOf;
// }

// return schema; //
// }

// async function applyBranchRule(schema, rule, daemon) {
// const [dimensionSlug, ...leafSpec] = rule.branch;

// // Fetch dimension from database
// const dimension = await daemon.entities.dimension.findOne({
//   slug: dimensionSlug,
//   ancestor: null,
// });

// if (!dimension) {
//   console.warn(`[schema] Dimension not found: ${dimensionSlug}`);
//   return;
// }

// await dimension.descendants.init();

// const propSchema = {
//   type: "string",
//   title: dimension.name || dimension.slug,
//   description: dimension.description || "",
// };

// // Handle leaf specification
// if (leafSpec.length > 0) {
//   const leaf = leafSpec[0];

//   if (leaf === "*") {
//     // Wildcard - allow any value (FREE dimension)
//     propSchema.type = "string";
//   } else if (Array.isArray(leaf)) {
//     // Specific allowed values
//     propSchema.enum = leaf;
//   } else if (typeof leaf === "string") {
//     // Single fixed value
//     propSchema.const = leaf;
//   }
// } else if (dimension.traits.includes("CATEGORICAL")) {
//   // Use all categories from dimension
//   const categories = dimension.descendants.getItems();
//   propSchema.enum = categories.map(({ slug }) => slug);
// }

// schema.properties[dimensionSlug] = propSchema;

// if (rule.required) {
//   schema.required.push(dimensionSlug);
// } //
// // }

// // function baseAnnotationSchema() {
// return {
//   type: "object",
//   title: "Annotation",
//   description: "Base annotation schema",
//   properties: {},
//   required: [],
//   additionalProperties: false,
// }; //
// // }

// function baseLiteralSchema(literaldataschema) {
//   return {
//     type: "object",
//     title: "Literal",
//     description: "Base literal schema",
//     properties: {
//       slug: { type: "string" },
//       // traits: { type: "array" },
//       annotation: { type: "object" },
//       data: {
//         type: "object",
//         title: "data",
//         description: "stores trait data",
//         // apply traits
//       },

//       // id: { type: "string" },
//       // createdAt: { type: "string" },
//       // updatedAt: { type: "string" },
//       // symbols: { type: "array" },
//     },
//     required: ["slug", "annotation", "data"],
//     additionalProperties: false,
//   };
// }

// function buildSubjectLiteralSchema(subject, annotationSchema, literalSchema) {
//   return object.merge(literalSchema, {
//     title: `${subject.name || subject.slug} Literal`,
//     description: subject.description,
//     properties: {
//       annotation: annotationSchema,
//     },
//     additionalProperties: false,
//   });
// }
