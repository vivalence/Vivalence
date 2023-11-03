/** @type { import('@storybook/sveltekit').StorybookConfig } */
const config = {
    stories: [
        "../src/**/*.stories.svelte",
        "../src/**/*.mdx"
        // "../stories/**/*.stories.mdx",
        // "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
    ],
    addons: [
        "@storybook/addon-links",
        "@storybook/addon-essentials",
        "@storybook/addon-interactions",
        "@storybook/addon-svelte-csf"
        // "@storybook/addon-styling-webpack"
    ],
    framework: {
        name: "@storybook/sveltekit",
        options: {}
    },
    docs: {
        autodocs: "tag"
    },
    core: {
        builder: "@storybook/builder-vite"
    }
};
export default config;
