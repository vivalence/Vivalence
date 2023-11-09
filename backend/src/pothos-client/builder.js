import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import { DateTimeResolver, JSONResolver } from "graphql-scalars";

import { prisma } from "../prisma-client.js";

const builder = new SchemaBuilder({
    plugins: [PrismaPlugin],
    prisma: {
        client: prisma,
        exposeDescriptions: { models: true, fields: true },
        filterConnectionTotalCount: true,
        onUnusedQuery: process.env.NODE_ENV === "production" ? null : "warn",
    },
});

builder.addScalarType("DateTime", DateTimeResolver, {});
builder.addScalarType("JSON", JSONResolver, {});

builder.queryType({});
builder.mutationType({});

export { builder };

// import ErrorsPlugin from "@pothos/plugin-errors";
// ErrorPlugin errorOptions: {defaultTypes: []}
// builder.objectType(Error, {name: "Error", fields: (t) => ({message: t.exposeString("message")})});
