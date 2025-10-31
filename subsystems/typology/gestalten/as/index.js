import { fromm, not, cast, is, prototypes } from "@vivalence/typology";

// // const fromFile = (url) => {
// //   // TODO: apply trace of 'file:/'
// // };

// *invertFromm('path', path)
export const path = {
  url: (url) => {
    return fromm.url(url).path;
  },
  params: (params) => {
    return fromm.params(params).path;
  },
};
