import { v } from "@vivalence/typology";

const RANK = ["RUNNING", "STOPPING", "PAUSED", "IDLE"];

export const loudest = (activities) => RANK.find((code) => activities.some((activity) => activity.status === code)) ?? "NONE";

export const owed = (signal, activities) => {
  const { MACHINE } = v.primitives.controller;
  return activities.filter((activity) => MACHINE.states[activity.status].settled !== true);
};

export const send = async (signal, activities, reason) => {
  const held = owed(signal, activities);
  await Promise.all(held.map((activity) => activity.controller.kill(signal, reason)));
  return { [signal]: held.map((activity) => activity.id) };
};
