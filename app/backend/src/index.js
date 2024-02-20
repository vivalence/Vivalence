import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";

import prisma from "./prisma-client.js";
import schema from "./pothos-client/schema.js";

if (process.env.SEED_STRATEGIES === "true") {
    console.log("Seeding strategies");
    await import("../prisma-server/seed/strategies/index.js");
}

import "./library/logging.js";
const PORT = process.env.PORT || 4000;

const app = express();
const httpServer = http.createServer(app);

const apolloServer = new ApolloServer({
    schema: schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await apolloServer.start();

const apolloMiddlewear = expressMiddleware(apolloServer, {
    context: async ({ req }) => {
        return { prisma, token: req.headers.token };
    },
});

app.use("/", cors(), bodyParser.json(), apolloMiddlewear);

await new Promise((resolve) => httpServer.listen({ port: PORT }, resolve));

console.log(`🚀 Server ready at http://localhost:${PORT}/`);
