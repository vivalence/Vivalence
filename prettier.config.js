module.exports = {
  tabWidth: 2,
  useTabs: false,
  singleQuote: false,
  printWidth: 100,
  semi: true,
  trailingComma: "all",
  bracketSpacing: true,
  bracketSameLine: true,
  svelteSortOrder: "options-scripts-markup-styles",
  svelteIndentScriptAndStyle: true,
  plugins: [
    require.resolve("prettier-plugin-svelte", {
      // @lj: i tried everything on my end. no other solution works. i dont know why. gotta be hardcoded. some deno/node weirdness.
      paths: ["/usr/local/lib/node_modules/prettier-plugin-svelte"],
    }),
  ],

  overrides: [{ files: "*.svelte", options: { parser: "svelte" } }],
};
