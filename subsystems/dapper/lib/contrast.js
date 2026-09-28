const HEX = /^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/;
const RGBA = /^rgba\((\d{1,3}), ?(\d{1,3}), ?(\d{1,3}), ?(0|1|0?\.\d+)\)$/;

export const channels = (color) => {
  const hex = HEX.exec(color);
  if (hex) return [parseInt(hex[1], 16), parseInt(hex[2], 16), parseInt(hex[3], 16), 1];
  const rgba = RGBA.exec(color);
  if (rgba) return [Number(rgba[1]), Number(rgba[2]), Number(rgba[3]), Number(rgba[4])];
  throw new Error(`[contrast] not a colour: ${JSON.stringify(color)}`);
};

const pair = (channel) => Math.round(channel).toString(16).padStart(2, "0").toUpperCase();

export const hex = ([red, green, blue]) => `#${pair(red)}${pair(green)}${pair(blue)}`;

export const wash = (color, ratio) => {
  const [red, green, blue] = channels(color);
  return `rgba(${red}, ${green}, ${blue}, ${ratio})`;
};

export const blend = (under, over, ratio) => {
  const below = channels(under);
  const above = channels(over);
  return hex([0, 1, 2].map((index) => below[index] + (above[index] - below[index]) * ratio));
};

export const flatten = (color, under) => {
  const [, , , alpha] = channels(color);
  return alpha === 1 ? hex(channels(color)) : blend(under, hex(channels(color)), alpha);
};

const linear = (channel) => {
  const share = channel / 255;
  return share <= 0.03928 ? share / 12.92 : ((share + 0.055) / 1.055) ** 2.4;
};

export const luminance = (color) => {
  const [red, green, blue] = channels(color);
  return 0.2126 * linear(red) + 0.7152 * linear(green) + 0.0722 * linear(blue);
};

export const contrast = (first, second) => {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
};
