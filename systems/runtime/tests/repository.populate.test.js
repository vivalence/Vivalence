import { specimen } from "@vivalence/typology";
import { seed } from "./scenarios/fixtures.js";
import { accio } from "./scenarios/registry.js";

let scenario;
let fetched;

specimen.beforeAll(async () => {
  const domain = await accio("@education/domain/language-learning");
  scenario = await seed(domain.entities);
  const connection = scenario.orm.em.getConnection();
  const execute = connection.execute.bind(connection);
  fetched = [];
  connection.execute = async (query, params, method, ...rest) => {
    const result = await execute(query, params, method, ...rest);
    if (method === "all") fetched.push({ query: String(query).slice(0, 120), rows: result.length });
    return result;
  };
});

specimen.afterAll(async () => {
  await scenario?.orm?.close();
});

specimen.describe("populate never multiplies", () => {
  specimen.it("a to-many populate under a to-many where and a limit fetches at most limit rows per query", async () => {
    fetched.length = 0;
    const literals = await scenario.entities.literal.find(
      { symbols: ["greeting", "casual"] },
      { limit: 2, populate: ["retentions"] },
    );
    specimen.expect(literals.length).toBe(2);
    specimen.expect(literals.every((literal) => literal.retentions.isInitialized())).toBe(true);
    const widest = Math.max(...fetched.map((entry) => entry.rows));
    specimen.expect(widest).toBeLessThanOrEqual(2);
  });
});
