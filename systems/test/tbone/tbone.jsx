import React, { useState, useEffect, useRef, createContext, useContext } from "npm:react@18";
import { render, Box, Text, useInput, useApp, useStdout, useStdin } from "npm:ink@5";

import { rects, bones, clampPincer, hit, PINCER_LEFT, PINCER_RIGHT } from "./geometry.js";

// ─── clock context ───────────────────────────────────────────
const ClockContext = createContext(new Date());

function ClockProvider({ children }) {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return <ClockContext.Provider value={now}>{children}</ClockContext.Provider>;
}

// ─── frame builder ───────────────────────────────────────────
function buildFrame(pincer, cols, rows, clockStr, grabbed) {
  const grid = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ ch: " ", color: null })),
  );

  function set(r, c, ch, color) {
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;
    grid[r][c] = { ch, color };
  }
  function writeStr(r, c, str, color) {
    for (let i = 0; i < str.length; i++) set(r, c + i, str[i], color);
  }

  const { col, row } = pincer;
  const ksLeft = col - PINCER_LEFT;
  const ksRight = col + PINCER_RIGHT;
  const stemColor = grabbed ? "magenta" : "green";

  // ─── panel A: rows 0..row-1, full width ───
  for (let c = 1; c < cols - 1; c++) set(0, c, "─", "green");
  set(0, 0, "┌", "green");
  set(0, cols - 1, "┐", "green");
  for (let r = 1; r < row - 1; r++) {
    set(r, 0, "│", "green");
    set(r, cols - 1, "│", "green");
  }
  // bottom border = bar, with keystone break + inline names
  for (let c = 1; c < cols - 1; c++) {
    if (c >= ksLeft && c <= ksRight) continue;
    set(row - 1, c, "─", "green");
  }
  set(row - 1, 0, "└", "green");
  set(row - 1, cols - 1, "┘", "green");
  set(row - 1, ksLeft, "┐", stemColor);
  set(row - 1, ksRight, "┌", stemColor);

  // inline names on shoulder/crown
  const shoulder = " @vivalence ";
  const shoulderRoom = ksLeft - 2;
  if (shoulderRoom >= shoulder.length) {
    const start = 1 + Math.floor((shoulderRoom - shoulder.length) / 2);
    writeStr(row - 1, start, shoulder, "cyan");
  }
  const crown = " terminal ";
  const crownRoom = cols - 2 - ksRight;
  if (crownRoom >= crown.length) {
    const start = ksRight + 1 + Math.floor((crownRoom - crown.length) / 2);
    writeStr(row - 1, start, crown, "cyan");
  }

  // ─── stem (keystone + spine): cols ksLeft..ksRight ───
  // mid row at `row`: ┤<< ├
  set(row, ksLeft, "┤", stemColor);
  set(row, ksLeft + 1, "<", stemColor);
  set(row, ksLeft + 2, "<", stemColor);
  set(row, ksLeft + 3, " ", stemColor);
  set(row, ksRight, "├", stemColor);

  // body rows (row+1 .. rows-3): │   │
  for (let r = row + 1; r < rows - 2; r++) {
    set(r, ksLeft, "│", stemColor);
    set(r, ksLeft + 1, " ", stemColor);
    set(r, ksLeft + 2, " ", stemColor);
    set(r, ksLeft + 3, " ", stemColor);
    set(r, ksRight, "│", stemColor);
  }
  // stem bottom at row rows-2: └───┘
  set(rows - 2, ksLeft, "└", stemColor);
  set(rows - 2, ksLeft + 1, "─", stemColor);
  set(rows - 2, ksLeft + 2, "─", stemColor);
  set(rows - 2, ksLeft + 3, "─", stemColor);
  set(rows - 2, ksRight, "┘", stemColor);

  // ─── panel B: cols 0..ksLeft-1, rows row..rows-1 ───
  set(row, 0, "┌", "magenta");
  set(row, ksLeft - 1, "┐", "magenta");
  for (let c = 1; c < ksLeft - 1; c++) set(row, c, "─", "magenta");
  for (let r = row + 1; r < rows - 1; r++) {
    set(r, 0, "│", "magenta");
    set(r, ksLeft - 1, "│", "magenta");
  }
  set(rows - 1, 0, "└", "magenta");
  set(rows - 1, ksLeft - 1, "┘", "magenta");
  for (let c = 1; c < ksLeft - 1; c++) set(rows - 1, c, "─", "magenta");

  // ─── panel C: cols ksRight+1..cols-1, rows row..rows-1 ───
  set(row, ksRight + 1, "┌", "yellow");
  set(row, cols - 1, "┐", "yellow");
  for (let c = ksRight + 2; c < cols - 1; c++) set(row, c, "─", "yellow");
  for (let r = row + 1; r < rows - 1; r++) {
    set(r, ksRight + 1, "│", "yellow");
    set(r, cols - 1, "│", "yellow");
  }
  set(rows - 1, ksRight + 1, "└", "yellow");
  set(rows - 1, cols - 1, "┘", "yellow");
  for (let c = ksRight + 2; c < cols - 1; c++) set(rows - 1, c, "─", "yellow");

  // ─── content (labels, clocks) ───
  writeStr(1, 2, "A · main", "green");
  if (row - 1 > 3) writeStr(3, 2, clockStr, "gray");

  if (row + 1 < rows - 1) writeStr(row + 1, 2, "B · status", "magenta");
  if (row + 3 < rows - 1) writeStr(row + 3, 2, clockStr, "gray");

  if (row + 1 < rows - 1) writeStr(row + 1, ksRight + 3, "C · inspect", "yellow");
  if (row + 3 < rows - 1) writeStr(row + 3, ksRight + 3, clockStr, "gray");

  return grid;
}

// ─── row → spans (consolidate same-color runs) ───────────────
function rowToSpans(row) {
  const spans = [];
  let current = null;
  for (const cell of row) {
    if (current && current.color === cell.color) {
      current.text += cell.ch;
    } else {
      if (current) spans.push(current);
      current = { color: cell.color, text: cell.ch };
    }
  }
  if (current) spans.push(current);
  return spans;
}

function Frame({ grid }) {
  return (
    <Box flexDirection="column">
      {grid.map((row, i) => {
        const spans = rowToSpans(row);
        return (
          <Text key={i}>
            {spans.map((s, k) => (
              <Text key={k} color={s.color || "white"}>{s.text}</Text>
            ))}
          </Text>
        );
      })}
    </Box>
  );
}

// ─── mouse driver ────────────────────────────────────────────
function useMouse(onMouse) {
  const { stdin, setRawMode, isRawModeSupported } = useStdin();
  useEffect(() => {
    if (!stdin || !isRawModeSupported) return;
    setRawMode(true);
    process.stdout.write("\x1b[?1006h\x1b[?1003h");
    const handler = (data) => {
      const s = data.toString("utf8");
      const re = /\x1b\[<(\d+);(\d+);(\d+)([Mm])/g;
      let m;
      while ((m = re.exec(s)) !== null) {
        onMouse({
          btn: parseInt(m[1], 10),
          x: parseInt(m[2], 10) - 1,
          y: parseInt(m[3], 10) - 1,
          release: m[4] === "m",
        });
      }
    };
    stdin.on("data", handler);
    return () => {
      stdin.off("data", handler);
      process.stdout.write("\x1b[?1003l\x1b[?1006l");
    };
  }, [stdin]);
}

// ─── layout (consumes clock context, builds + renders frame) ───
function Layout({ pincer, cols, rows, grabbed }) {
  const now = useContext(ClockContext);
  const clockStr = now.toTimeString().slice(0, 8);
  const grid = buildFrame(pincer, cols, rows, clockStr, grabbed);
  return <Frame grid={grid} />;
}

// ─── app ─────────────────────────────────────────────────────
function App() {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const [cols, setCols] = useState(stdout.columns);
  const [rows, setRows] = useState(stdout.rows - 1);
  const [pincer, setPincer] = useState(() =>
    clampPincer(
      { col: Math.floor(stdout.columns / 3), row: Math.floor((stdout.rows - 1) / 2) },
      stdout.columns,
      stdout.rows - 1,
    ),
  );
  const [grabbed, setGrabbed] = useState(null);

  useEffect(() => {
    const onResize = () => {
      const c = stdout.columns;
      const r = stdout.rows - 1;
      setCols(c);
      setRows(r);
      setPincer((p) => clampPincer(p, c, r));
    };
    stdout.on("resize", onResize);
    return () => stdout.off("resize", onResize);
  }, [stdout]);

  useInput((input, key) => {
    if (input === "q" || (key.ctrl && input === "c")) return exit();
    const step = key.shift ? 5 : 1;
    if (key.leftArrow)  setPincer((p) => clampPincer({ ...p, col: p.col - step }, cols, rows));
    if (key.rightArrow) setPincer((p) => clampPincer({ ...p, col: p.col + step }, cols, rows));
    if (key.upArrow)    setPincer((p) => clampPincer({ ...p, row: p.row - step }, cols, rows));
    if (key.downArrow)  setPincer((p) => clampPincer({ ...p, row: p.row + step }, cols, rows));
  });

  const stateRef = useRef({ pincer, cols, rows, grabbed });
  stateRef.current = { pincer, cols, rows, grabbed };

  useMouse((evt) => {
    const { pincer: p, cols: cc, rows: rr, grabbed: g } = stateRef.current;
    const buttonBits = evt.btn & 0b11;
    const isMotion = (evt.btn & 32) !== 0;
    const b = bones(p, cc, rr);

    if (evt.release) {
      setGrabbed(null);
      return;
    }
    if (!isMotion && buttonBits === 0 && !g) {
      if (hit(evt.x, evt.y, b.keystone)) {
        setGrabbed({ kind: "keystone", offsetX: evt.x - p.col, offsetY: evt.y - p.row });
      } else if (hit(evt.x, evt.y, b.shoulder) || hit(evt.x, evt.y, b.crown)) {
        setGrabbed({ kind: "horizontal" });
      } else if (hit(evt.x, evt.y, b.spine)) {
        setGrabbed({ kind: "vertical" });
      }
      return;
    }
    if (isMotion && g) {
      if (g.kind === "keystone") {
        setPincer(clampPincer({ col: evt.x - g.offsetX, row: evt.y - g.offsetY }, cc, rr));
      } else if (g.kind === "horizontal") {
        setPincer((prev) => clampPincer({ ...prev, row: evt.y }, cc, rr));
      } else if (g.kind === "vertical") {
        setPincer((prev) => clampPincer({ ...prev, col: evt.x }, cc, rr));
      }
    }
  });

  return (
    <ClockProvider>
      <Layout pincer={pincer} cols={cols} rows={rows} grabbed={grabbed} />
    </ClockProvider>
  );
}

render(<App />);
