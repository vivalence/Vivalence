// specimen.describe("Request", () => {
//   specimen.describe("construction", () => {
//     specimen.it("from object", () => {
//       const req = new Request({
//         url: "http://api.io/users",
//         method: "POST",
//         body: { name: "test" },
//       });

//       specimen.expect(req.url).toBeInstanceOf(Url);
//       specimen.expect(req.method).toBe("POST");
//       specimen.expect(req.body).toEqual({ name: "test" });
//     });

//     specimen.it("defaults method to POST", () => {
//       const req = new Request({ url: "/endpoint" });
//       specimen.expect(req.method).toBe("POST");
//     });

//     specimen.it("accepts Url instance", () => {
//       const url = new Url("http://test.io/path");
//       const req = new Request({ url });
//       specimen.expect(req.url.absolute).toBe("http://test.io/path");
//     });
//   });
// });
