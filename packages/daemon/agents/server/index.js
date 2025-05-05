import { Application } from "oak";
import discoverRouter from "./routes/discover.js";

const app = new Application();

app.use(discoverRouter.routes());
app.use(discoverRouter.allowedMethods());

app.addEventListener("listen", ({ port, secure }) => {
  console.log(`Server listening on ${secure ? "https" : "http"}://localhost:${port}`);
});

await app.listen({ port: 3000 });
