import * as types from "../types.js";

export const CAP_DEFAULT = 10;

export const blank = () => ({
  pick: "all",
  bins: { all: [], any: [], none: [] },
  signals: [...types.MISSED],
  status: [],
  limit: CAP_DEFAULT,
  rank: { $gte: null, $lte: null },
  search: "",
});

export const fresh = () => ({ draft: blank(), aimed: "all", symQ: "", kind: null });
