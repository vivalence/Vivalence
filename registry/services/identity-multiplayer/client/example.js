import { Application, Router } from "oak";
import createIdentity from "./identity/server.js";

const app = new Application();
const router = new Router();
const identity = createIdentity("my-secret-key");

app.use(identity.middleware());

router.post("/auth/login", identity.routes.login);
router.post("/auth/register", identity.routes.register);

router.get("/profile", identity.requireAuth(), (ctx) => {
  ctx.response.body = {
    message: `Hello ${ctx.state.user.username}`,
    user: ctx.state.user,
  };
});

router.get("/posts", identity.requireAuth(), async (ctx) => {
  const posts = await getPostsForUser(ctx.state.user.id);
  ctx.response.body = { posts };
});

router.post("/posts", identity.requireAuth(), async (ctx) => {
  const { title, content } = await ctx.request.body();
  const post = await createPost({
    title,
    content,
    authorId: ctx.state.user.id,
  });
  ctx.response.body = { post };
});

router.get("/public", (ctx) => {
  ctx.response.body = {
    message: "This is public",
    authenticated: ctx.state.isAuthenticated,
    user: ctx.state.user || null,
  };
});

app.use(router.routes());
app.use(router.allowedMethods());

await app.listen({ port: 8000 });
