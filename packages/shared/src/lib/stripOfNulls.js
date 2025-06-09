export default function stripNullsInPlace(obj) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    for (let i = obj.length - 1; i >= 0; i--) {
      if (obj[i] === null) {
        obj.splice(i, 1);
      } else {
        stripNullsInPlace(obj[i]);
      }
    }
    return obj;
  }

  for (const key of Object.keys(obj)) {
    if (obj[key] === null) {
      delete obj[key];
    } else {
      stripNullsInPlace(obj[key]);
    }
  }

  return obj;
}
