import { wrap } from "@mikro-orm/core";
import { deepMerge } from "@vivalence/shared";

export default async function installUnit(input, ctx) {
  let operation = "";
  let status = "success";

  if (!input.unit.slug)
    input.unit.slug = await ctx.runtime.call("/unit/identity", input.unit);

  const pre_issues = await ctx.runtime.validate //
    .unit(input.unit, ["SCHEMATIC"]);
  if (pre_issues.length > 0) {
    console.error("[/unit/install] issues", pre_issues);
    throw new Error("Invalid unit");
  }

  let unit = await ctx.runtime.entities.unit.findOne(
    { slug: input.unit.slug },
    { populate: ["updatedAt"] },
  );

  if (!unit) {
    unit = ctx.runtime.entities.unit.create(input.unit);
    operation = "create";
  } else {
    unit = wrap(unit).assign(input.unit, { mergeObjectProperties: true });
    operation = "update";
  }

  unit.data = unit.data || {};
  unit.data.index = unit.data.index || null;
  unit.data.known = unit.data.known || null;
  unit.data.learning = unit.data.learning || null;
  unit.data.example = deepMerge(
    { known: null, learning: null },
    unit.data.example,
  );
  await ctx.runtime.entities.em.flush();

  await unit.tags.init();
  const issues = await ctx.runtime.assert.unit(unit);
  if (issues.length > 0) {
    console.log("[UNIT INSTALL] ISSUES NOT RESOLVED. issues:", issues);
    ctx.runtime.entities.em.remove(unit);
    await ctx.runtime.entities.em.flush();
    operation = "remedy";
    status = "failure";
    // const issuesFilePath = path.resolve("./issues.json"); let existingIssues = []; try {if (fs.existsSync(issuesFilePath)) {const fileContent = await fs.readFile(issuesFilePath, "utf8"); existingIssues = JSON.parse(fileContent);}} catch (error) {console.error(`Error reading issues.json: ${error.message}`);} issues.map((i) => existingIssues.push(i)); try {await fs.writeFile(issuesFilePath, JSON.stringify(existingIssues, null, 2), "utf8"); console.log(`[UNIT INSTALL] Issues logged to ${issuesFilePath}`);} catch (error) {console.error(`Error writing to issues.json: ${error.message}`);}
  }

  return { unit, operation, status };
}
