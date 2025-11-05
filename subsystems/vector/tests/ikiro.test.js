import { Vector } from "@vivalence/vector";
import { specimen } from "@vivalence/typology";
let vector;

specimen.describe("Vector", () => {
  specimen.it("cycles", () => {
    vector = new Vector().branch("/text");
    // console.log([vector], { vector });
  });
});
