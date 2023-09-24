import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import { DateTimeResolver, JSONResolver } from "graphql-scalars";

import { prisma } from "../prisma.js";

export const builder = new SchemaBuilder({
    plugins: [PrismaPlugin],
    prisma: {
        client: prisma,
        exposeDescriptions: { models: true, fields: true },
        filterConnectionTotalCount: true,
        onUnusedQuery: process.env.NODE_ENV === "production" ? null : "warn"
    }
});

builder.queryType({});
builder.mutationType({});

builder.addScalarType("DateTime", DateTimeResolver, {});
builder.addScalarType("JSON", JSONResolver, {});
