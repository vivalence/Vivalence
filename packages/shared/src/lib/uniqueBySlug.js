const uniqueBySlug = (arr) => {
  const seen = new Set();

  if (!arr) return [];

  return arr.flat().filter((item) => {
    const val = item.manifest?.slug;

    if (seen.has(val)) {
      console.warn(`Duplicate module found: ${item.manifest?.type}:${val}`, item.manifest);
      return false;
    }

    seen.add(val);
    return true;
  });
};

export default uniqueBySlug;
