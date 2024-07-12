const { join } = require("path");
const forms = require("@tailwindcss/forms");
const { skeleton } = require("@skeletonlabs/tw-plugin");

/** @type {import('tailwindcss').Config}*/
const config = {
    darkMode: "class",
    purge: false,

    theme: {
        extend: {}
    },
    plugins: [
        skeleton({
            themes: { preset: [{ name: "rocket", enhancements: true }] }
        }),
        forms
    ],
    content: [
        "./src/**/*.{html,js,svelte,ts}",
        "../../ontologies/*/src/games/**/*.{html,svelte}",
        join(require.resolve("@skeletonlabs/skeleton"), "../**/*.{html,svelte}")
    ]
};

module.exports = config;
