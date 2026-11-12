export const spoken = (dictation) =>
  [...dictation.turns, ...(dictation.open ? [dictation.open] : [])]
    .flatMap((turn) => turn.parts)
    .map((part) => part.text.trim())
    .filter(Boolean)
    .join(" ");

export const tail = (dictation) =>
  (dictation.open ? dictation.open.parts : []).map((part) => (part.draft ? part.draft.text : "")).join(" ");
