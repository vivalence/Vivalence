import { createHash } from "crypto";
import jwt from "jsonwebtoken";

const createIdentity = (secret = "your-secret-key") => {
  const users = new Map();
  const sessions = new Map();

  const hash = (password) =>
    createHash("sha256").update(password).digest("hex");

  const generateToken = (user) =>
    jwt.sign({ id: user.id, username: user.username }, secret, {
      expiresIn: "24h",
    });

  const verifyToken = (token) => {
    try {
      return jwt.verify(token, secret);
    } catch {
      return null;
    }
  };

  const createUser = (username, password) => {
    const id = crypto.randomUUID();
    const user = { id, username, password: hash(password) };
    users.set(username, user);
    return { id, username };
  };

  const authenticate = (username, password) => {
    const user = users.get(username);
    if (!user || user.password !== hash(password)) {
      throw new Error("Invalid credentials");
    }
    return { id: user.id, username: user.username };
  };

  const middleware = () => async (ctx, next) => {
    const token = ctx.request.headers.authorization?.replace("Bearer ", "");
    const payload = token ? verifyToken(token) : null;

    ctx.state.user = payload;
    ctx.state.isAuthenticated = !!payload;

    await next();
  };

  const requireAuth = () => async (ctx, next) => {
    if (!ctx.state.isAuthenticated) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Authentication required" };
      return;
    }
    await next();
  };

  const routes = {
    login: async (ctx) => {
      const { username, password } = await ctx.request.body();

      try {
        const user = authenticate(username, password);
        const token = generateToken(user);

        ctx.response.body = { token, user };
      } catch (error) {
        ctx.response.status = 401;
        ctx.response.body = { error: error.message };
      }
    },

    register: async (ctx) => {
      const { username, password } = await ctx.request.body();

      if (users.has(username)) {
        ctx.response.status = 409;
        ctx.response.body = { error: "User already exists" };
        return;
      }

      const user = createUser(username, password);
      ctx.response.body = { message: "User created", user };
    },
  };

  return {
    middleware,
    requireAuth,
    routes,
    createUser,
    authenticate,
    verifyToken,
  };
};

export default createIdentity;
