import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import { prisma } from "./prisma-client.js";
import { schema } from "./graphql/index.js";

const apolloServer = new ApolloServer({ schema: schema });

const { url } = await startStandaloneServer(apolloServer, {
    context: () => ({ prisma }),
    listen: { port: 4000 }
});

console.log(`🚀  Server ready at: ${url}`);
