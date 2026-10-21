import { atom } from "nanostores";
import { persistentAtom } from "@nanostores/persistent";

export class Bridge {
  $terminal = persistentAtom("viva.seat", null, { encode: JSON.stringify, decode: JSON.parse });
  $viewport = atom({ width: null, height: null, narrow: false });
  $focus = atom("composer");
  $sidebar = atom({ open: false, width: 39 });
  $draft = atom("");
  $selected = atom(0);
  $hidden = atom([]);
  $theme = atom(null);
  $popover = atom(null);
  $phonePane = atom("dock");
  $widget = atom(null);
  $float = atom({});
  $selection = atom(null);
  $signin = atom({ user: "", pass: "" });
  $sections = atom({ filter: {}, expand: {}, pick: null, hostsOff: { thread: [], mode: [] }, traits: { thread: [], mode: ["VIEWABLE"] } });

  get terminal() {
    return this.$terminal.get();
  }

  get viewport() {
    return this.$viewport.get();
  }

  get focus() {
    return this.$focus.get();
  }

  get sidebar() {
    return this.$sidebar.get();
  }

  get draft() {
    return this.$draft.get();
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
