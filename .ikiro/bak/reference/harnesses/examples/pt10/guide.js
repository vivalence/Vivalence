export const guide = {
  guide: { title: "PT10 frame kit", source: "droneaid manual v2" },
  parts: [
    { id: "frame", label: "Frame" },
    { id: "arm", label: "Arm ×4" },
    { id: "motor", label: "Motor 2207 ×4" },
    { id: "prop", label: "Propeller 5\" ×4" },
  ],
  steps: [
    { section: "Overview", title: "Everything in the kit", parts: [], text: ["Lay out every part."], warn: [], prep: {} },
    { section: "Frame", title: "Bolt the arms", parts: ["frame", "arm"], text: ["Slide each arm into the frame slot.", "Tighten crosswise."], warn: [], prep: { Bolts: "16 mm ×8", Tool: "Hex 2.0" } },
    { section: "Motors", title: "Mount the motors", parts: ["motor", "arm"], text: ["Seat the motor on the arm plate.", "Thread the wires through the arm."], warn: ["Motor bolts longer than 6 mm touch the windings."], prep: { Bolts: "M3 6 mm ×16", Tool: "Hex 2.0" } },
    { section: "Check", title: "Spin up", parts: ["prop"], text: ["Fit props last.", "Arm on the bench, throttle 5%."], warn: ["Props on, battery in: the drone is live. Stand clear."], prep: {} },
  ],
};
