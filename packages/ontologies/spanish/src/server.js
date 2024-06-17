import Koa from "koa";
import dotenv from "dotenv";
import cors from "@koa/cors";
import body from "koa-body";

import locals from "./locals";
import auth from "./auth";
import router from "./router";

dotenv.config();
const app = new Koa();

app.use(cors());
app.use(locals);
app.use(auth);
app.use(body());
app.use(router.routes()).use(router.allowedMethods());

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});

// import path from "path";
// import serve from "koa-static";
// const filePath = path.join(__dirname + "/games/conjugations/ui/");
// console.log(filePath);
// app.use(serve(filePath));
