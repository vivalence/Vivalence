import { Trajectory } from "../../core/trajectory.ts";
import sig from "../../parsers/sig.ts";

export function createTrajectory() {
  const trajectory = new Trajectory([sig]);

  trajectory.branch(sig.pattern("/functions", "Home of all functions.")).open(
    sig.pattern({
      path: "/test",
      valence: `call this function to demo function calling capabilities.`,
      // input: Type.Object({ text: Type.String() }),
    }),
    async (input, ctx) => {
      // console.log("[TRAJECTORY CALLED] input", input);
      const output = input.text;
      return output;
    },
  );

  trajectory.use(async (input, ctx, next) => {
    ctx.database = {
      users: (username) => ({
        name: username,
        id: username === "finn" ? "123" : "unknown",
      }),
    };
    return await next();
  });

  const usersTrajectory = trajectory.branch(sig.pattern("/users"));

  usersTrajectory.use(async (input, ctx, next) => {
    if (input.username) {
      ctx.user = ctx.database.users(input.username);
    }
    return await next();
  });

  const userDetailTrajectory = usersTrajectory.branch(
    sig.pattern("/:username"),
  );

  userDetailTrajectory.use(async (input, ctx, next) => {
    // console.log("middleware input", input);
    const result = await next();
    // console.log("middleware result", result);
    return result;
  });

  userDetailTrajectory.open(sig.pattern("/a.tson"), (input, ctx) => {
    return { world: "hello", user: ctx.user };
  });

  return trajectory;
}
