import fs from "fs-extra";

import * as path from "@std/path";

import { deepMerge } from "@vivalence/shared";
import { wrap } from "@mikro-orm/core";

export default async function installUnit(input, ctx) {
  let operation = "";
  let status = "success";

  if (!input.unit.slug) throw new Error("Slug missing");

  let unit = await ctx.runtime.entities.unit.findOne(
    {
      slug: input.unit.slug,
      runtime: ctx.runtime.entity.id,
    },
    { populate: ["updatedAt"] },
  );

  if (!unit) {
    unit = ctx.runtime.entities.unit.create(input.unit);
    await ctx.runtime.entities.em.flush();
    operation = "create";
  } else {
    unit = wrap(unit).assign(input.unit);
    operation = "update";
  }

  unit.data = unit.data || {};
  unit.data.index = unit.data.index || null;
  unit.data.known = unit.data.known || null;
  unit.data.learning = unit.data.learning || null;
  unit.data.example = deepMerge(unit.data.example, { known: null, learning: null });

  await unit.tags.init();
  const asserter = ctx.runtime.ontology.assert.unit;
  const issues = await ctx.runtime.ontology.remedy.factory({ entity: unit, asserter }, ctx);

  // console.log("issues", JSON.stringify(issues, null, 2));

  if (issues.length > 0) {
    console.log("[UNIT INSTALL] ISSUES NOT RESOLVED. issues:", issues);
    ctx.runtime.entities.em.remove(unit);
    operation = "remedy";
    status = "failure";
    // const issuesFilePath = path.resolve("./issues.json"); let existingIssues = []; try {if (fs.existsSync(issuesFilePath)) {const fileContent = await fs.readFile(issuesFilePath, "utf8"); existingIssues = JSON.parse(fileContent);}} catch (error) {console.error(`Error reading issues.json: ${error.message}`);} issues.map((i) => existingIssues.push(i)); try {await fs.writeFile(issuesFilePath, JSON.stringify(existingIssues, null, 2), "utf8"); console.log(`[UNIT INSTALL] Issues logged to ${issuesFilePath}`);} catch (error) {console.error(`Error writing to issues.json: ${error.message}`);}
  }

  await ctx.runtime.entities.em.flush();
  return { unit, operation, status };
}
