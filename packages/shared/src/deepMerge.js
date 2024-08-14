export default function deepMerge(...objects) {
  const isObject = (obj) => obj && typeof obj === "object";

  return objects.reduce(
    (prev, obj) => {
      if (obj === null || typeof obj !== "object") return prev;

      Object.keys(obj).forEach((key) => {
        const pVal = prev[key];
        const oVal = obj[key];

        if (Array.isArray(oVal)) {
          prev[key] = Array.isArray(pVal) ? [...pVal, ...oVal] : oVal;
        } else if (isObject(oVal)) {
          prev[key] = isObject(pVal) ? deepMerge(pVal, oVal) : oVal;
        } else {
          prev[key] = oVal;
        }
      });

      return prev;
    },
    Array.isArray(objects[0]) ? [] : {}
  );
}
