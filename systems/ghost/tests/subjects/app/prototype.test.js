import { specimen } from "@vivalence/typology";
import * as ghost from "@vivalence/ghost";

const user = (trait) => ({ runtime: { lighthouse: { user: { traits: Object.keys(trait), trait } } } });
const mask = (trait) => ({ mask: { manifest: { type: "client", slug: "ghost", traits: Object.keys(trait) }, trait } });

specimen.describe("the App's theme — the mask's THEMED, else the user's; before sign-in porcelain", () => {
  specimen.it("the mask's THEMED wins over the user's", () => {
    const client = new ghost.client.Client({ ...mask({ THEMED: "northsea" }), ...user({ THEMED: "porcelain" }) });
    specimen.expect(new ghost.app.App({ client }).theme).toBe("northsea");
  });

  specimen.it("a mask that names none: the user's, as the cast filled it", () => {
    const client = new ghost.client.Client({ ...mask({}), ...user({ THEMED: "porcelain" }) });
    specimen.expect(new ghost.app.App({ client }).theme).toBe("porcelain");
  });

  specimen.it("before sign-in the client's user is {}: porcelain", () => {
    const client = new ghost.client.Client({ ...mask({}) });
    specimen.expect(client.user).toEqual({});
    specimen.expect(new ghost.app.App({ client }).theme).toBe("porcelain");
  });
});
