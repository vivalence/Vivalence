import { Type, Static } from "@sinclair/typebox"; // i might want to proxy in my own controller.

export const Context = Type.Object(
  {},
  {
    description: "",
  },
);

export const Slug = Type.String({
  description: "Unique Identifier. URL conform.",
});

// export { Type, Static };
