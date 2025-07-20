// import { wrap } from "@mikro-orm/core";
// import { deepMerge } from "@vivalence/shared";

export default async function validateUnit(input, ctx) {
  let operation = "";
  let status = "success";

  const unit = await ctx.runtime.entities.unit.findOne(
    { slug: input.unit.slug },
    { populate: ["tags"] },
  );

  if (!unit) {
    return { unit, operation: "abort due to missing", status: "failure" };
  }

  const asserter = ctx.runtime.ontology.assert.unit;
  const issues = await ctx.runtime.ontology.remedy.factory(
    { entity: unit, asserter, processors: input.processors },
    ctx,
  );

  if (issues.length > 0) {
    console.log("[UNIT VALIDATION] ISSUES NOT RESOLVED ");
    console.log("issues:", issues);
    console.log("unit:", unit);
    // ctx.runtime.entities.em.remove(unit);
    operation = "remedy";
    status = "failure";
    // const issuesFilePath = path.resolve("./issues.json"); let existingIssues = []; try {if (fs.existsSync(issuesFilePath)) {const fileContent = await fs.readFile(issuesFilePath, "utf8"); existingIssues = JSON.parse(fileContent);}} catch (error) {console.error(`Error reading issues.json: ${error.message}`);} issues.map((i) => existingIssues.push(i)); try {await fs.writeFile(issuesFilePath, JSON.stringify(existingIssues, null, 2), "utf8"); console.log(`[UNIT INSTALL] Issues logged to ${issuesFilePath}`);} catch (error) {console.error(`Error writing to issues.json: ${error.message}`);}
  }

  await ctx.runtime.entities.em.flush();
  return { unit, operation, status, issues };
}
