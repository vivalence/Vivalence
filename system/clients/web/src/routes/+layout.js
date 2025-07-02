import context from "@client/context";
// import sidebar from "./sidebar.js";

export const load = async (event) => {
  const ctx = await context(event);
  // const menudata = await sidebar(ctx);

  return { ctx };
};
