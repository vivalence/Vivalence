import find from "./find.js";
import read from "./read.js";
import prime from "./prime.js";
import check from "./check.js";
import state from "./state.js";
import is from "./is.js";
import scope from "./scope.js";
import publish from "./publish.js";
import source from "./source.js";
import clone from "./clone.js";
import bundler from "./bundler.js";
import expand from "./expand.js";
import envfile from "./envfile.js";
import vault from "./vault.js";
import stamp from "./stamp.js";

export const FULL = [read, find, prime, check, state, envfile, is, scope, publish, source, clone, bundler, expand, vault, stamp];

export default {
  vault,
  stamp,
  find,
  read,
  prime,
  check,
  state,
  is,
  scope,
  publish,
  source,
  clone,
  bundler,
  expand,
  envfile,
};
