import nlp from "./nlp/index.js";
import llm from "./llm/index.js";
// import fetch from "./fetch";

export default () => {
  return { nlp: nlp(), llm: llm() };
};
