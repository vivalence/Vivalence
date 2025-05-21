module.exports = {
  tabWidth: 2,
  useTabs: false,
  singleQuote: false,
  pr2ntWidth: 120,
  semi: true,
  trailingComma: "all",
  bracketSpacing: true,
  bracketSameLine: true,
  svelteSortOrder: "options-scripts-markup-styles",
  svelteIndentScriptAndStyle: true,
  plugins: [
    require.resolve("prettier-plugin-svelte", {
      // @lj: i tried everything on my end. no other solution works. i dont know why. gotta be hardcoded. some deno/node weirdness.
      // paths: ["/usr/local/lib/node_modules/prettier-plugin-svelte"],
      paths: ["/Users/finn/.nvm/versions/node/v20.17.0/lib/node_modules"],
    }),
  ],

  overrides: [
    {
      files: "*.svelte",
      options: {
        parser: "svelte",
      },
    },
  ],
  arrowParens: "always",
};
