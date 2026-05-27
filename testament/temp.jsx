// FIELD + INPUT — ascii video background with an input panel composited on top.
//
// run:  deno run --env-file=./testament/.env -A ./testament/temp.jsx
//
// ink has no z-overlay, so we paint the input into the frame's cell grid:
// build {char,fg,bg} per cell from the video frame, then overwrite a centered
// panel region with a dark bg + the live input text. one true overlay.

import { Box, React, render, Text, useApp, useEffect, useInput, useState } from "@vivalence/sheets";

const ASCI =
  "/Users/finn/vivalence/organization/10-19_viva/18_vinca/18.34_assets/video_assets/asci/frames.json";
const data = JSON.parse(new TextDecoder().decode(await Deno.readFile(ASCI)));

const PANEL = { top: 10, bottom: 15, left: 14, right: data.cols - 14 };

// row of {char,fg,bg} → [{text,fg,bg}] runs of same fg+bg
function rowRuns(cells) {
  const out = [];
  let i = 0;
  while (i < cells.length) {
    const { fg, bg } = cells[i];
    let j = i;
    let text = "";
    while (j < cells.length && cells[j].fg === fg && cells[j].bg === bg) text += cells[j++].char;
    out.push({ fg, bg, text });
    i = j;
  }
  return out;
}

function Field() {
  const { exit } = useApp();
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState("");

  useEffect(() => {
    const timer = setInterval(() => setIndex((n) => (n + 1) % data.frames.length), 1000 / data.fps);
    return () => clearInterval(timer);
  }, []);

  useInput((input, key) => {
    if (key.escape || key.return) return exit();
    if (key.backspace || key.delete) return setValue((v) => v.slice(0, -1));
    if (input) setValue((v) => v + input);
  });

  // video frame → mutable cell grid
  const grid = data.frames[index].rows.map((row) =>
    [...row.g].map((char, x) => ({ char, fg: data.palette[row.c[x]], bg: undefined })),
  );

  // composite the input panel over it
  for (let y = PANEL.top; y <= PANEL.bottom; y++) {
    for (let x = PANEL.left; x <= PANEL.right; x++) {
      grid[y][x] = { char: " ", fg: "#fcd8d8", bg: "#1a0606" };
    }
  }
  const label = "username › ";
  const text = label + value + "█";
  const midY = Math.floor((PANEL.top + PANEL.bottom) / 2);
  const innerW = PANEL.right - PANEL.left + 1;
  const startX = PANEL.left + Math.max(0, Math.floor((innerW - text.length) / 2));
  for (let i = 0; i < text.length && startX + i <= PANEL.right; i++) {
    grid[midY][startX + i].char = text[i];
  }

  return (
    <Box flexDirection="column">
      {grid.map((cells, y) => (
        <Text key={y}>
          {rowRuns(cells).map((run, i) => (
            <Text key={i} color={run.fg} backgroundColor={run.bg}>{run.text}</Text>
          ))}
        </Text>
      ))}
    </Box>
  );
}

render(<Field />);
