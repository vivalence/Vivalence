export const KEYMAPPED = (mode) => {
  if (mode.module === null) throw new Error(`[keymapped] ${mode.reference.absolute}: a remote mode's keymap rides its surface module, which m87's surface.load has not landed`);
  mode.keymap.graft(mode.module.keymap);
};
