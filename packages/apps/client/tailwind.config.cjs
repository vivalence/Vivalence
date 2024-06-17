const { join } = require("path");
const forms = require("@tailwindcss/forms");
const { skeleton } = require("@skeletonlabs/tw-plugin");

/** @type {import('tailwindcss').Config}*/
const config = {
    mode: "jit",
    darkMode: "class",
    content: [
        "./src/**/*.{html,js,svelte,ts}",
        join(require.resolve("@skeletonlabs/skeleton"), "../**/*.{html,js,svelte,ts}")
    ],

    theme: {
        extend: {}
    },

    plugins: [
        skeleton({
            themes: { preset: [{ name: "rocket", enhancements: true }] }
        }),
        forms
    ],
};

module.exports = config;
