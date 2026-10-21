import { mergeProps } from "solid-js";

export const ICONS = {
  plus: '<path d="M8 3.25v9.5M3.25 8h9.5"></path>',
  x: '<path d="M4 4l8 8M12 4l-8 8"></path>',
  back: '<path d="M10 3 5 8l5 5"></path>',
  clip: '<path d="M13.2 7.6 8.1 12.7a3.2 3.2 0 0 1-4.5-4.5l5.6-5.6a2.1 2.1 0 0 1 3 3L6.6 11.2a1 1 0 0 1-1.5-1.5l4.8-4.8"></path>',
  mic: '<rect x="5.5" y="1.75" width="5" height="8.5" rx="2.5"></rect><path d="M3 7.5a5 5 0 0 0 10 0M8 12.5v2"></path>',
  up: '<path d="M8 13V3M3.5 7.5 8 3l4.5 4.5"></path>',
  chev2: '<path d="M8 3.5 3.5 8 8 12.5M12.5 3.5 8 8l4.5 4.5"></path>',
  stop: '<rect x="4" y="4" width="8" height="8" rx="1"></rect>',
  minimize: '<path d="M3.5 11.5h9"></path>',
  restore: '<rect x="3" y="3.5" width="10" height="9" rx="1"></rect><path d="M3 6.5h10"></path>',
  find: '<circle cx="7" cy="7" r="4.5"></circle><path d="M10.5 10.5 14 14"></path>',
  side: '<rect x="2" y="3" width="12" height="10" rx="1"></rect><path d="M6 3v10"></path>',
  expand: '<path d="M9 3h4v4M13 3 8.5 7.5M7 13H3V9M3 13l4.5-4.5"></path>',
  chev: '<path d="M6 3l5 5-5 5"></path>',
  dock: '<rect x="2" y="3" width="12" height="10" rx="1"></rect><path d="M10 3v10"></path>',
  dockl: '<rect x="2" y="3" width="12" height="10" rx="1"></rect><path d="M6 3v10"></path>',
  dockopen: '<rect x="2" y="3" width="12" height="10" rx="1"></rect><path d="M10 3v10" stroke-dasharray="2 2"></path>',
  dockopenl: '<rect x="2" y="3" width="12" height="10" rx="1"></rect><path d="M6 3v10" stroke-dasharray="2 2"></path>',
  cube: '<path d="M2.5 5 8 2.25 13.5 5v6L8 13.75 2.5 11z"></path><path d="M2.5 5 8 7.75 13.5 5M8 7.75v6"></path>',
  sys: '<circle cx="8" cy="8" r="2.25"></circle><path d="M3.4 3.4a6.5 6.5 0 0 0 0 9.2M12.6 3.4a6.5 6.5 0 0 1 0 9.2"></path>',
  brace: '<path d="M9 2c-2.5 0-3 1-3 3v1.5c0 1-.5 1.5-2 1.5c1.5 0 2 .5 2 1.5V11c0 2 .5 3 3 3"></path>',
  bracer: '<path d="M7 2c2.5 0 3 1 3 3v1.5c0 1 .5 1.5 2 1.5c-1.5 0-2 .5-2 1.5V11c0 2-.5 3-3 3"></path>',
  speaker: '<path d="M2.5 6.5v3h2.5L8.5 12V4L5 6.5z"></path><path d="M10.5 6a3 3 0 0 1 0 4M12 4.2a5.4 5.4 0 0 1 0 7.6"></path>',
};

const drawn = (name) => {
  if (!Object.hasOwn(ICONS, name)) throw new Error(`[drapes] no icon ${JSON.stringify(name)} · ${Object.keys(ICONS).join(" · ")}`);
  return ICONS[name];
};

export const Icon = (props) => {
  const held = mergeProps({ size: 16 }, props);
  return (
    <svg
      width={held.size}
      height={held.size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      innerHTML={drawn(held.name)}
    />
  );
};
