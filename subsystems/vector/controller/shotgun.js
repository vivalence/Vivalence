import { compose } from "./carry.js";
import { scope } from "./match.js";
// match compile and apply all
// import { NotFound } from "../types/errors.js"; import { compose, chain, forward } from "./carry.js"; import { scope } from "./match.js"; export function shotgun(vector, signal) {const matches = scope(vector, signal); if (matches.length === 0) throw new NotFound(signal); // return matches.map(([match, trajectory, effect]) => {let carry = compose(vector.carry); let steps = [match]; if (trajectory) {carry = chain(carry, compose(trajectory.carry));} return { effect, carry, steps, trajectory, match };});} export async function applyShotgun(vector, signal, context = {}) {const results = shotgun(vector, signal); return await Promise.all(results.map(async ({ effect, carry, match }) => {if (!effect) return null; const ctx = { ...context, match, params: match.parameters || {} }; let result; await carry(ctx, async () => {result = await effect(ctx);}); return result;})).then(results => results.filter(Boolean));}
// export function shotgun(vector, signal) {for (const [matched, trajectory, effect] of scope(vector, signal)) {let carry = forward; let steps = []; let remainder = 0; // for (const signal of signals) {const [[match, trajectory, effect] = []] = greedy(position, signal); if (!match) throw new NotFound(signal); steps.push(match); if (match.type === "remainder") {match.params = { [remainder++]: match.signature }; if (signals.length === steps.length) {carry = chain(carry, compose(position.carry)); if (effect) return [effect, carry, position, steps];} continue;} carry = chain(carry, compose(position.carry)); if (effect && trajectory && signals.length !== steps.length) {position = trajectory; continue;} if (effect) return [effect, carry, steps, position]; if (trajectory) position = trajectory;} return [null, carry, steps, position];}
// class Yeet {constructor(effect, carry, match, steps = []) {this.effect = effect; this.carry = carry; this.match = match; this.steps = steps;} static from(match, trajectory, effect, vector) {const carry = compose([vector.carry, trajectory?.carry].flat().filter(Boolean),); return new Shot(effect, carry, match, [match]);}} export function shotgun(vector, signals) {return signals .flatMap((signal) => scope(vector, signal)) .filter(([match]) => match) .map(([match, trajectory, effect]) => Shot.from(match, trajectory, effect, vector),);} export const shoot = async (vector, signals, context = {}) => {const shots = shotgun(vector, signals); const results = await Promise.all(shots.map(async (shot) => {if (!this.effect) return null; const ctx = {...context, match: this.match, params: this.match.parameters || {},}; let result; await this.carry(ctx, async () => {result = await this.effect(ctx);}); return result;}),); return results.filter(Boolean);};

export const shotgun = (vector, signals) => {
  return signals
    .flatMap((signal) => scope(vector, signal))
    .filter(([match]) => match) //
    .map(([match, trajectory, effect]) => ({
      effect,
      carry: compose([vector.carry, trajectory?.carry].flat().filter(Boolean)),
      steps: [match],
      match,
    }));
};

// example
// export const shoot = async (vector, signals, context = {}) =>
//   Promise.all(
//     shotgun(vector, signals) //
//       .map(async ({ effect, carry, match }) => {
//         if (!effect) return null;
//         const ctx = { ...context, match, params: match.parameters || {} };
//         let result;
//         await carry(ctx, async () => (result = await effect(ctx)));
//         return result;
//       }),
//   ).then((results) => results.filter(Boolean));
