import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { prisma } from "./prisma";
import { schema } from "./graphql";

const apolloServer = new ApolloServer({ schema: schema });

const { url } = await startStandaloneServer(apolloServer, {
  context: () => ({ prisma }),
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
