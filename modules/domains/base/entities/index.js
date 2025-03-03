import {} from // AnnotationRepository,
// TopographyRepository,
//   ConstraintRepository,
"@vivalence/schema";

async function boot(runtime) {
  // let ontology = {
  //   annotations: new AnnotationRepository(),
  //   // topographies: new TopographyRepository(),
  //   // constraints: new ConstraintsRepository(),
  //   // issues: new IssueRepository(),
  //   //
  // };

  // runtime.ontology = ontology;
  return runtime;
}
export default { boot };

// games, tactics, units, tags,
// entities.boot(runtime)
// runtime.entities.[...domainEntities]
