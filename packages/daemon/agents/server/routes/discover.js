import { Router } from "oak";
import { AxAI } from "@ax-llm/ax";
import { handleDiscovery } from "../agents/discovery.js";
import { Intent, IntentStatusEnum } from "../lib/intent.js";

const router = new Router();

const ai = new AxAI({
  name: "openai",
  apiKey: process.env.OPENAI_API_KEY,
  config: {
    temperature: 0.2,
    model: "gpt-4o",
  },
});

router.post("/discover", async (ctx) => {
  const body = await ctx.request.body.json();
  const { intent: intentData, message } = body;

  let intent;
  if (intentData.status) {
    intent = Intent.fromStorage(intentData);
  } else {
    intent = new Intent(intentData.id, intentData.manifest);
  }

  const { intent: updatedIntent, response } = await handleDiscovery(
    ai,
    intent,
    message,
  );

  const headers = new Headers();
  if (ctx.request.headers.get("accept") === "text/event-stream") {
    headers.set("Content-Type", "text/event-stream");
    headers.set("Cache-Control", "no-cache");
    headers.set("Connection", "keep-alive");

    ctx.response.body = new ReadableStream({
      start(controller) {
        controller.enqueue(
          `data: ${JSON.stringify({ response, done: false })}\n\n`,
        );

        controller.enqueue(
          `data: ${JSON.stringify({
            intent: updatedIntent.storable,
            response,
            done: true,
          })}\n\n`,
        );

        controller.close();
      },
    });
    ctx.response.headers = headers;
  } else {
    ctx.response.body = {
      intent: updatedIntent.storable,
      response,
    };
  }
});

export default router;
