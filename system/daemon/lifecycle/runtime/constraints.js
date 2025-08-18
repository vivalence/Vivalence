import { validators } from "@vivalence/shared";
import { obj } from "@vivalence/shared";

export function constraints(rme) {
  const runtime = rme.instance;

  for (const dimension of runtime.ontology.dimension.topographical) {
    const topography = runtime.ontology.topography.findOne(dimension);
    if (!topography) continue;
    schematicConstraint(topography, runtime);
  }

  if (rme.register.domain.lifecycle.constraints)
    rme.register.domain.lifecycle.constraints(rme.instance);
}

function schematicConstraint(topography, runtime) {
  let validator = null;
  const schema = runtime.schema.annotations[topography.slug];

  runtime.ontology.constraint.create({
    branch: ["annotation", topography.slug],
    traits: ["SCHEMATIC"],
    predicate: async (annotation) => {
      if (!validator) validator = validators.viva.precompiled(schema);

      const issues = await validator(annotation);
      return issues.map((issue) => {
        issue.path.unshift("annotation");
        issue.context["annotation"] = annotation;
        return issue;
      });
    },
  });
}
