/** @type { import('@storybook/svelte').Preview } */
// .storybook/preview.js

import "../src/app.postcss";

const preview = {
    parameters: {
        actions: { argTypesRegex: "^on[A-Z].*" },

        backgrounds: {
            default: "dark",
            values: [
                {
                    name: "light",
                    value: "#F2F4F6"
                },
                {
                    name: "dark",
                    value: "#0E0F10"
                }
            ]
        },
        controls: {
            matchers: {
                color: /(background|color)$/i,
                date: /Date$/i
            }
        }
    }
};

export default preview;
