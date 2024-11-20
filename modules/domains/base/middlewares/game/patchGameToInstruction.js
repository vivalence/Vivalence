export default async function patchGameToInstruction(body, ctx) {
  if (ctx.request.url.pathname.includes("/provision")) {
    if (body && typeof body !== "string") {
      function patch(instruction) {
        instruction.type = "GAME";
        instruction.game = {
          id: ctx.state.game.id,
          slug: ctx.state.game.slug,
          url: ctx.runtime.manifest.url + ctx.state.game.url,
          bundle: ctx.state.game.bundle,
        };
        return instruction;
      }

      if (body.instruction) {
        body = patch(body);
      } else if (body.length) {
        body = body.map(patch);
      }
    }
  }
  return body;
}
