import process from "node:process";
import { Buffer } from "node:buffer";

export const QUERY = "\x1b]1337;ReportCellSize\x07\x1b[16t\x1b[14t\x1b[18t\x1b[c";
export const DEADLINE = 200;

const ANSWERED = /\x1b\[\?[\d;]*c/;

export const REPLIES = [
  /\x1b\]1337;ReportCellSize=[\d.;]*(?:\x07|\x1b\\)/g,
  /\x1b\[[468];\d+;\d+t/g,
  /\x1b\[\?[\d;]*c/g,
];

export const leftover = (text) => REPLIES.reduce((rest, pattern) => rest.replace(pattern, ""), text);

const numbers = (text, pattern) => text.match(pattern).slice(1).map(Number);

export const MEASURES = [
  [
    (text) => /\x1b\]1337;ReportCellSize=[\d.]+;[\d.]+;[\d.]+/.test(text),
    (text) => {
      const [height, width, scale] = numbers(text, /ReportCellSize=([\d.]+);([\d.]+);([\d.]+)/);
      return { scale, cell: { width: width * scale, height: height * scale } };
    },
  ],
  [
    (text) => [/\x1b\[6;\d+;\d+t/, /\x1b\[4;\d+;\d+t/, /\x1b\[8;\d+;\d+t/].every((pattern) => pattern.test(text)),
    (text) => {
      const [height, width] = numbers(text, /\x1b\[6;(\d+);(\d+)t/);
      const [, area] = numbers(text, /\x1b\[4;(\d+);(\d+)t/);
      const [, columns] = numbers(text, /\x1b\[8;(\d+);(\d+)t/);
      return { scale: width / (area / columns), cell: { width, height } };
    },
  ],
  [() => true, () => UNMEASURED],
];

export const UNMEASURED = { scale: null, cell: null };

export const measured = (text) => MEASURES.find(([test]) => test(text))[1](text);

export const display = async (stdin = process.stdin, stdout = process.stdout, deadline = DEADLINE) => {
  if (!stdin.isTTY) return UNMEASURED;
  const raw = stdin.isRaw;
  stdin.setRawMode(true);
  let text = "";
  const replied = await new Promise((resolve) => {
    const listen = (chunk) => {
      text += Buffer.from(chunk).toString("latin1");
      if (ANSWERED.test(text)) finish(true);
    };
    const finish = (answered) => {
      clearTimeout(timer);
      stdin.removeListener("data", listen);
      stdin.pause();
      resolve(answered);
    };
    const timer = setTimeout(() => finish(false), deadline);
    stdin.on("data", listen);
    stdout.write(QUERY);
  });
  stdin.setRawMode(raw);
  const rest = leftover(text);
  if (rest.length > 0) stdin.unshift(Buffer.from(rest, "latin1"));
  return replied ? measured(text) : UNMEASURED;
};
