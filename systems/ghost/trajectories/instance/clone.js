import paladin from "@vivalence/paladin";
import { resolve } from "@std/path";
import { React, Box, Text, Select, TextInput, useState } from "@vivalence/sheets";

export async function clone(ctx) {
  console.log("CTX");
  // console.log(paladin.)
  const identifier =
    ctx.signal.params[0] ?? (await ctx.view.form(SlugPicker, { options: await variants() }));

  if (!identifier) return (ctx.effect = { aborted: true });

  const targetInput =
    ctx.signal.params[1] ?? (await ctx.view.form(TargetPicker, { initial: `./${identifier}` }));
  if (!targetInput) return (ctx.effect = { aborted: true });

  const target = resolve(Deno.cwd(), targetInput);
  ctx.effect = { slug: identifier, target };
}

async function variants() {
  await paladin.vip.mount(paladin.scope.registry);
  const cakes = await paladin.vip.list({ type: "variant" });
  return cakes.map((cake) => ({ label: cake.manifest.slug, value: cake.manifest.slug }));
}

function SlugPicker({ options, done }) {
  return React.createElement(
    Box,
    { flexDirection: "column" },
    React.createElement(Text, null, "clone which variant?"),
    React.createElement(Select, { items: options, onSelect: (item) => done(item.value ?? item) }),
  );
}

function TargetPicker({ initial, done }) {
  const [value, setValue] = useState(initial);
  return React.createElement(
    Box,
    { flexDirection: "column" },
    React.createElement(Text, null, "clone to which path?"),
    React.createElement(TextInput, { value, onChange: setValue, onSubmit: done }),
  );
}
