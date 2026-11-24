const PINOUT = "manual/6d8443726d85.webp";
const EXAMPLES = "manual/3e32c1fc316b.webp";

const WIRED = { text: "All wires are soldered according to the correct pinout.", kind: "WIRES" };

export const views = {};

export const sections = [
  ["safety", "Before you solder"],
  ["pinout", "Pinouts"],
  ["signs", "Signs of good soldering"],
];

export const steps = [
  {
    section: "safety",
    name: "Safety",
    pages: [],
    placements: [],
    lines: ["Keep your hands away from your face while you work.", "Wash your hands when you are done."],
    notes: [{ text: "Wash your hands after soldering. Don’t touch your face while working.", kind: "WARNING" }],
    tools: [],
    images: [],
  },
  {
    section: "safety",
    name: "Practice first",
    pages: [],
    placements: [],
    lines: ["Train on spare cables and a training board before you solder the drone's boards."],
    notes: [{ text: "If you never soldered before, you can also train with cables and training boards.", kind: "TIP" }],
    tools: [],
    images: [],
  },
  {
    section: "pinout",
    name: "Receiver (ELRS)",
    pages: [],
    placements: [],
    lines: ["Yellow wire to RX.", "White wire to TX.", "Red wire to 5V.", "Black wire to ground (−)."],
    notes: [WIRED],
    tools: [],
    images: [PINOUT],
  },
  {
    section: "pinout",
    name: "Servo to the flight controller",
    pages: [],
    placements: [],
    lines: ["Red wire to 5V.", "Brown wire to GD.", "Yellow wire to S7."],
    notes: [WIRED],
    tools: [],
    images: [PINOUT],
  },
  {
    section: "pinout",
    name: "VTX to the flight controller",
    pages: [],
    placements: [],
    lines: ["Red wire to VCC.", "Black wire to GD.", "Blue wire to T5.", "Green wire to R5."],
    notes: [WIRED],
    tools: [],
    images: [PINOUT],
  },
  {
    section: "signs",
    name: "Check every joint",
    pages: [],
    placements: [],
    lines: [
      "All solder pads are fully covered with solder, including the power pads on the underside of the ESC.",
      "The exposed part of the wire is completely embedded in the solder joint and does not stick out.",
      "The solder forms a shiny, smooth, rounded drop.",
      "The soldering looks neat and is mechanically strong.",
      "All wires are soldered according to the correct pinout.",
    ],
    notes: [],
    tools: [],
    images: [EXAMPLES],
  },
];

export const guide = {
  slug: "soldering",
  name: "Soldering",
  description: "Quality soldering checklist; can be done in parallel with Frame Assembly",
  lines: ["The joints every build needs before its boards go in: how to work, what goes where, how a good joint looks."],
  images: [PINOUT],
  notes: [{ text: "Wash your hands after soldering. Don’t touch your face while working.", kind: "WARNING" }],
};
