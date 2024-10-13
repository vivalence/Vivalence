import logic from "json-logic-js";

export default (rules, data) => {
  return logic.apply(rules, data);
};
