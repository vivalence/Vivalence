import SchemaBuilder from "@pothos/core";
import PrismaPlugin from "@pothos/plugin-prisma";
import { DateTimeResolver, JSONResolver } from "graphql-scalars";

import { log } from "../library/logging.js";
import { prisma } from "../prisma-client.js";

// import TracingPlugin, { wrapResolver, isRootField } from "@pothos/plugin-tracing";

const builder = new SchemaBuilder({
    plugins: [PrismaPlugin],
    prisma: {
        client: prisma,
        exposeDescriptions: { models: true, fields: true },
        filterConnectionTotalCount: true,
        onUnusedQuery: process.env.NODE_ENV === "production" ? null : "warn",
    },
    // tracing: {
    //     default: (config) => isRootField(config),
    //     wrap: (resolver, options, config) =>
    //         wrapResolver(resolver, (error, duration) => {
    //             const entry = {
    //                 name: `${config.parentType}.${config.name}`,
    //                 duration,
    //                 message: `Executed resolver ${config.parentType}.${config.name} in ${duration}ms`,
    //             };
    //             if (error)
    //                 log("resolverError", {
    //                     ...entry,
    //                     message: `Error for resolver ${config.parentType}.${config.name} ${error}`,
    //                     error,
    //                 });
    //             else log("resolver", entry);
    //         }),
    // },
});

builder.addScalarType("DateTime", DateTimeResolver, {});
builder.addScalarType("JSON", JSONResolver, {});

builder.queryType({});
builder.mutationType({});

export default builder;
export { builder };

// import ErrorsPlugin from "@pothos/plugin-errors";
// ErrorPlugin errorOptions: {defaultTypes: []}
// builder.objectType(Error, {name: "Error", fields: (t) => ({message: t.exposeString("message")})});
