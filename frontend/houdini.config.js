import { DateTimeResolver, DateTimeMock } from "graphql-scalars";
/// <references types="houdini-svelte">

/** @type {import('houdini').ConfigFile} */
const config = {
    watchSchema: {
        url: "http://localhost:4000"
    },
    plugins: {
        "houdini-svelte": {}
    },
    scalars: {
        DateTime: DateTimeResolver
    }
};

export default config;
