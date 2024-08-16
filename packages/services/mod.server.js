import nlp from "./nlp/index.js";
import llm from "./llm/index.js";

export default () => {
  return { nlp: nlp(), llm: llm() };
};
