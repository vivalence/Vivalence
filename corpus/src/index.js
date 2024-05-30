import Koa from "koa";
import Router from "@koa/router";
import { someFunction } from "./index.js";

const app = new Koa();
const router = new Router();

router.get("/", (ctx) => {
    ctx.body = "Hello from the Spanish Koa server!";
});

router.get("/function", (ctx) => {
    someFunction();
    ctx.body = "Function from corpus/spanish executed.";
});

app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
