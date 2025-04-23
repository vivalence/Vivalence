export function getPersonAndNumber(index) {
  const persons = ["1", "2", "3", "1", "2", "3"];
  const numbers = ["sing", "sing", "sing", "plur", "plur", "plur"];
  return {
    person: persons[index],
    number: numbers[index],
  };
}
