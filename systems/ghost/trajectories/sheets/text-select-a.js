import { render, Select, React } from "@vivalence/sheets";

const DUMMY_ITEMS = ["alpha", "beta", "gamma", "delta"];

export default async function textSelect(ctx) {
  const items = ctx.signal?.params?.items ?? ctx.input?.items ?? DUMMY_ITEMS;
  return new Promise((resolve) => {
    const instance = render(
      React.createElement(Select, {
        items,
        onSelect: (item) => {
          const value = item.value ?? item;
          instance.unmount();
          console.log("picked:", value);
          resolve(value);
        },
      }),
    );
  });
}
