// specimen.describe("Response", () => {
//   specimen.describe("construction", () => {
//     specimen.it("computes ok from status", () => {
//       specimen.expect(new Response({ status: 200 }).ok).toBe(true);
//       specimen.expect(new Response({ status: 201 }).ok).toBe(true);
//       specimen.expect(new Response({ status: 299 }).ok).toBe(true);
//       specimen.expect(new Response({ status: 400 }).ok).toBe(false);
//       specimen.expect(new Response({ status: 500 }).ok).toBe(false);
//     });
//   });
// });
