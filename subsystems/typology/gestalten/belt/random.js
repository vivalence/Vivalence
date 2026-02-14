import { id as ID } from "./id.js";

export function number(min, max, integer = false) {
  const random = Math.random() * (max - min) + min;
  return integer ? Math.floor(random) : random;
}

export function string(length, symbolSet = "alphanumeric") {
  const symbolSets = {
    alphanumeric:
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    alpha: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    numeric: "0123456789",
    loremipsum:
      "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua",
  };

  if (symbolSet === "loremipsum") {
    const words = symbolSets.loremipsum.split(" ");
    let result = "";
    while (result.length < length) {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      if (result.length === 0) {
        result = randomWord.charAt(0).toUpperCase() + randomWord.slice(1);
      } else {
        result += " " + randomWord;
      }
    }
    return result.slice(0, length - 1) + ".";
  }

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

export function array(length) {
  const result = [];

  const generators = [
    () => null,
    () => undefined,
    () => Math.random() > 0.5,
    () => number(-1000, 1000),
    () => string(number(3, 15, true)),
    () => new Date(number(0, Date.now())),
    () =>
      Math.random() > 0.8 ? NaN : Math.random() > 0.5 ? Infinity : -Infinity,
    () => ({}),
    () => [],
    () => new Set(),
    () => new Map(),
    () => function () {},
    () => () => {},
    () => {
      const obj = {};
      const props = number(1, 5, true);
      for (let i = 0; i < props; i++) {
        obj[string(number(3, 8, true))] =
          generators[Math.floor(Math.random() * (generators.length - 3))]();
      }
      return obj;
    },
    () => {
      const arr = [];
      const items = number(1, 5, true);
      for (let i = 0; i < items; i++) {
        arr.push(
          generators[Math.floor(Math.random() * (generators.length - 3))](),
        );
      }
      return arr;
    },
    () =>
      new RegExp(string(number(1, 5, true)), Math.random() > 0.5 ? "g" : ""),
    () => Symbol(string(number(3, 10, true))),
    () => new Uint8Array(number(1, 10, true)),
    () =>
      new Promise((resolve) =>
        resolve(
          generators[Math.floor(Math.random() * (generators.length - 3))](),
        ),
      ),
  ];

  for (let i = 0; i < length; i++) {
    const randomGenerator =
      generators[Math.floor(Math.random() * generators.length)];
    result.push(randomGenerator());
  }

  return result;
}

export function id() {
  return ID(string("4"));
}
