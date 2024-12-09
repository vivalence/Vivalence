import duplicates from "./duplicates.js";

export default async function diagnostics(aperture) {
  const router = aperture.router.create();

  await [
    duplicates,
    //
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve({ router }));

  aperture.router.use("/diagnostics", router.routes(), router.allowedMethods());
  return aperture;
}
