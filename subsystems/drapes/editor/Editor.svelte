<script>
  import { EditorState, EditorSelection, Compartment } from "@codemirror/state";
  import {
    EditorView,
    keymap,
    lineNumbers,
    highlightActiveLine,
    highlightActiveLineGutter,
    highlightSpecialChars,
    drawSelection,
    rectangularSelection,
  } from "@codemirror/view";
  import { history, defaultKeymap, historyKeymap, indentWithTab } from "@codemirror/commands";
  import { search, searchKeymap, highlightSelectionMatches } from "@codemirror/search";
  import { syntaxHighlighting, bracketMatching, indentOnInput, foldGutter, foldKeymap } from "@codemirror/language";
  import { language } from "./languages.js";
  import { theme, highlight } from "./theme.js";
  import { External, NONE, diff, originated } from "./sync.js";

  let {
    text = $bindable(""),
    format = "txt",
    readonly = false,
    numbers = true,
    folds = false,
    keys = NONE,
    onsave = null,
    oncaret = null,
  } = $props();

  const grammar = new Compartment();
  const editable = new Compartment();
  const modal = new Compartment();

  let view = null;

  const support = $derived(language(format));
  const locked = $derived(EditorState.readOnly.of(readonly));

  const save = {
    key: "Mod-s",
    preventDefault: true,
    run: () => {
      onsave?.();
      return true;
    },
  };

  const extensions = () => [
    modal.of(keys),
    numbers ? [lineNumbers(), highlightActiveLineGutter()] : [],
    folds ? foldGutter() : [],
    highlightSpecialChars(),
    drawSelection(),
    rectangularSelection(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    bracketMatching(),
    indentOnInput(),
    history(),
    search({ top: true }),
    syntaxHighlighting(highlight),
    theme,
    grammar.of(support),
    editable.of(locked),
    keymap.of([save, ...defaultKeymap, ...historyKeymap, ...searchKeymap, ...foldKeymap, indentWithTab]),
    EditorView.lineWrapping,
    EditorView.updateListener.of((update) => {
      if (update.docChanged && !originated(update)) text = update.state.doc.toString();
      if (update.selectionSet || update.docChanged)
        oncaret?.(update.state.doc.lineAt(update.state.selection.main.head).number);
    }),
  ];

  const mount = (node) => {
    view = new EditorView({ parent: node, state: EditorState.create({ doc: text, extensions: extensions() }) });
    return {
      destroy: () => {
        view.destroy();
        view = null;
      },
    };
  };

  $effect(() => {
    const next = text;
    if (!view) return;
    const held = view.state.doc.toString();
    if (next === held) return;
    const { head } = view.state.selection.main;
    view.dispatch({
      changes: diff(held, next),
      selection: EditorSelection.cursor(Math.min(head, next.length)),
      annotations: External.of(true),
    });
  });

  $effect(() => {
    view?.dispatch({ effects: grammar.reconfigure(support) });
  });

  $effect(() => {
    view?.dispatch({ effects: editable.reconfigure(locked) });
  });

  $effect(() => {
    view?.dispatch({ effects: modal.reconfigure(keys) });
  });
</script>

<div class="editor" use:mount></div>

<style>
  .editor {
    height: 100%;
    min-height: 0;
    overflow: hidden;
  }
  .editor :global(.cm-editor) {
    height: 100%;
  }
</style>
