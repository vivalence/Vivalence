export const byStatus = (resource, accept) => {
  if (!resource.memory) {
    if (accept.includes(null)) return true;
    if (accept.includes("UNTOUCHED")) return true;
  }

  if (accept.includes(resource.memory?.status)) return true;

  return false;
};

export default { byStatus };
