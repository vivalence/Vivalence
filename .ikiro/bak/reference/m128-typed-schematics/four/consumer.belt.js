import { cast, fn, is, object, v } from "@vivalence/typology";
import { extend } from "../s5/paladin/gestalten/belt/faculties.js";
import { faults } from "../s5/paladin/prototypes/telemetry.js";
import { inherit, label, named } from "../s5/paladin/instance/lifecycle/2-resolution.js";

const isString = is.string;
const isObject = is.object;
const isEmpty = is.empty;
const objectFilter = object.filter;
const castLookup = cast.lookup;
const fnMemo = fn.memo;
const vClone = v.clone;
const vInterface = v.interface;
const vIsNever = v.isNever;
const vEnvironment = v.environment;
const paladinExtend = extend;
const telemetryFaults = faults;
const resolutionInherit = inherit;
const resolutionLabel = label;
const resolutionNamed = named;

console.log(isString, isObject, isEmpty, objectFilter, castLookup, fnMemo, vClone, vInterface, vIsNever, vEnvironment);
console.log(paladinExtend, telemetryFaults, resolutionInherit, resolutionLabel, resolutionNamed);
