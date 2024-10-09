export default function deepEquals(obj1, obj2) {
  return Object.is(JSON.stringify(obj1), JSON.stringify(obj2));
}
