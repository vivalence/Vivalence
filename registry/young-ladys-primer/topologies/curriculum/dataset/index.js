import subjects from "./symbols/subjects.js";
import strands from "./symbols/strands.js";
import ages from "./symbols/ages.js";

export default {
  schema: {},
  entities: {
    symbol: [...subjects, ...strands, ...ages],
  },
};
