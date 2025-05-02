/**
 * random.js - A collection of utility functions for generating random values
 *
 * This module exports three functions:
 * - number: Generates a random number between a min and max value
 * - string: Creates a random string using either a custom symbol set or lorem ipsum
 * - array: Produces an array filled with random JavaScript entities
 */

/**
 * Generates a random number between min and max (inclusive)
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {boolean} [integer=false] - Whether to return an integer (default: false)
 * @returns {number} Random number between min and max
 */
function number(min, max, integer = false) {
  const random = Math.random() * (max - min) + min;
  return integer ? Math.floor(random) : random;
}

/**
 * Generates a random string
 * @param {number} length - Length of the string to generate
 * @param {string|'alphanumeric'|'alpha'|'numeric'|'loremipsum'} [symbolSet='alphanumeric'] - Character set to use
 * @returns {string} Random string
 */
function string(length, symbolSet = "alphanumeric") {
  // Predefined symbol sets
  const symbolSets = {
    alphanumeric: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    numeric: "0123456789",
    loremipsum:
      "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
  };

  // Handle loremipsum specially
  if (symbolSet === "loremipsum") {
    const words = symbolSets.loremipsum.split(" ");
    let result = "";
    while (result.length < length) {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      if (result.length === 0) {
        // Capitalize first word
        result = randomWord.charAt(0).toUpperCase() + randomWord.slice(1);
      } else {
        result += " " + randomWord;
      }
    }
    // Trim to exact length and add period at the end
    return result.slice(0, length - 1) + ".";
  }

  // For other symbol sets
  const chars =
    typeof symbolSet === "string" && symbolSet in symbolSets
      ? symbolSets[symbolSet]
      : symbolSet || symbolSets.alphanumeric;

  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Generates an array of random JavaScript entities
 * @param {number} length - Length of the array
 * @returns {Array} Array of random JavaScript entities
 */
function array(length) {
  const result = [];

  // Functions to generate different types of random values
  const generators = [
    // Simple primitives
    () => null,
    () => undefined,
    () => Math.random() > 0.5,
    () => number(-1000, 1000),
    () => string(number(3, 15, true)),

    // Dates
    () => new Date(number(0, Date.now())),

    // Special numbers
    () => (Math.random() > 0.8 ? NaN : Math.random() > 0.5 ? Infinity : -Infinity),

    // Simple objects
    () => ({}),
    () => [],
    () => new Set(),
    () => new Map(),

    // Functions
    () => function () {},
    () => () => {},

    // Complex objects
    () => {
      const obj = {};
      const props = number(1, 5, true);
      for (let i = 0; i < props; i++) {
        obj[string(number(3, 8, true))] = generators[Math.floor(Math.random() * (generators.length - 3))]();
      }
      return obj;
    },

    // Arrays with content
    () => {
      const arr = [];
      const items = number(1, 5, true);
      for (let i = 0; i < items; i++) {
        arr.push(generators[Math.floor(Math.random() * (generators.length - 3))]());
      }
      return arr;
    },

    // RegExp
    () => new RegExp(string(number(1, 5, true)), Math.random() > 0.5 ? "g" : ""),

    // Symbol
    () => Symbol(string(number(3, 10, true))),

    // TypedArrays
    () => new Uint8Array(number(1, 10, true)),

    // Promises
    () => new Promise((resolve) => resolve(generators[Math.floor(Math.random() * (generators.length - 3))]())),
  ];

  for (let i = 0; i < length; i++) {
    const randomGenerator = generators[Math.floor(Math.random() * generators.length)];
    result.push(randomGenerator());
  }

  return result;
}

export default { number, string, array };
