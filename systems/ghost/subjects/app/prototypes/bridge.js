import { atom } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";

export class Bridge {
  $terminal = persistentAtom("viva.bridge.terminal", null, { encode: JSON.stringify, decode: JSON.parse });
  $viewport = atom({ width: null, height: null, narrow: false });
  $focus = atom("dock.input");
  $focusHistory = atom([]);
  $sidebar = atom({ open: false, width: 39 });
  $draft = atom("");
  $uploads = atom([]);
  $dictation = atom(null);
  $dictationFault = atom(null);
  $call = atom(null);
  $selected = atom(0);
  $hidden = atom([]);
  $theme = persistentAtom("viva.bridge.theme", null, { encode: JSON.stringify, decode: JSON.parse });
  $font = persistentAtom("viva.bridge.font", "base", { encode: JSON.stringify, decode: JSON.parse });
  $popover = atom(null);
  $phonePane = atom("dock");
  $widget = atom(null);
  $float = atom({});
  $frames = persistentAtom("viva.bridge.frames", {}, { encode: JSON.stringify, decode: JSON.parse });
  $selection = atom(null);
  $signin = atom({ user: "", pass: "" });
  $sections = atom({ filter: {}, expand: {}, peeks: {}, views: {}, current: null, pick: null, hostsOff: { thread: [], mode: [] }, traits: { thread: [], mode: ["SURFACED"] } });

  constructor() {
    this.$focus.listen((held, left) => {
      if (left !== null) this.$focusHistory.set([...this.focusHistory, left].slice(-6));
    });
  }

  get terminal() {
    return this.$terminal.get();
  }

  get viewport() {
    return this.$viewport.get();
  }

  get focus() {
    return this.$focus.get();
  }

  get focusHistory() {
    return this.$focusHistory.get();
  }

  get sidebar() {
    return this.$sidebar.get();
  }

  get draft() {
    return this.$draft.get();
  }

  get uploads() {
    return this.$uploads.get();
  }

  get dictation() {
    return this.$dictation.get();
  }

  get dictationFault() {
    return this.$dictationFault.get();
  }

  get call() {
    return this.$call.get();
  }

  get selected() {
    return this.$selected.get();
  }

  get hidden() {
    return this.$hidden.get();
  }

  get theme() {
    return this.$theme.get();
  }

  get font() {
    return this.$font.get();
  }

  get popover() {
    return this.$popover.get();
  }

  get phonePane() {
    return this.$phonePane.get();
  }

  get widget() {
    return this.$widget.get();
  }

  get float() {
    return this.$float.get();
  }

  get frames() {
    return this.$frames.get();
  }

  get selection() {
    return this.$selection.get();
  }

  get signin() {
    return this.$signin.get();
  }

  get sections() {
    return this.$sections.get();
  }
}
