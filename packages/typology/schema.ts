import { Type, Static } from "@sinclair/typebox";

// i might want to proxy in my own controller..
// export { Type, Static };

export const Slug = Type.String({
  description: "Unique Identifier. URL conform.",
});
