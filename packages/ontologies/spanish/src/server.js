import Koa from "koa";
import dotenv from "dotenv";
import body from "koa-body";

import locals from "./locals";
import cors from "./cors";
import auth from "./auth";
import router from "./router";

dotenv.config();

const app = new Koa();

app.use(cors);
app.use(body());
app.use(locals);
app.use(auth);
app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});
