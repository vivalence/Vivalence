import { Context, BufferMode } from "@vivalence/interface";

export default async function (input, context) {
  async function makeGameBuffer(instruction, hook) {
    const mode = new BufferMode(
      { bundle: instruction.bundle },
      new Context({
        ...context,
        instruction,
        game: await context.domain.modules.game({
          slug: instruction.bundle.game.slug,
        }),
      }),
      hook,
    );

    context.buffer.push(mode);
  }

  return [
    new BufferMode(
      { bundle: context.strategy.bundle },
      new Context({ ...context, pushGame: makeGameBuffer }),
      hooks,
    ),
  ];

  // buffer.onNext((previous, next, promise) => ctx.runtime(`/feed/remove`, next));
}
