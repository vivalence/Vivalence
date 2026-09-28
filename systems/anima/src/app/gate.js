export const gateFor = (authorized, status) => {
  if (!authorized) return "signin";
  if (status.code === "OFFLINE" || status.code === "ERROR") return "signin";
  if (status.code === "POPULATING") return "populating";
  if (status.code !== "VERIFIED") return "verifying";
  return "ready";
};
