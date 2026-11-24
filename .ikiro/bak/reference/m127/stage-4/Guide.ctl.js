    openPicker: (note = null) => retain({ picker: note === null ? true : { note } }),
    togglePicture: (path) =>
      editStep((held) => {
        const next = pictured.includes(path) ? pictured.filter((one) => one !== path) : [...pictured, path];
        if (noted === null) held.images = next;
        else held.notes[noted] = { ...held.notes[noted], images: next };
      }),
    look: (said) =>
      editStep((held) => {
        for (const id of local.sel) {
          held.staged = { ...(held.staged ?? {}), placements: restaged(held.staged?.placements, id, said) };
        }
      }),
    unlook: (id) =>
      editStep((held) => {
        held.staged = { ...held.staged, placements: held.staged.placements.filter((one) => one.literal !== id) };
      }),
    pose: (text) => {
      if (!text.trim()) return ctl.look({ translation: null });
      const at = text.split(/[\s,]+/).filter(Boolean).map(Number);
      if (at.length !== 3 || at.some(Number.isNaN)) return say("seat", "three numbers, comma separated: x, y, z in metres");
      ctl.look({ translation: at });
    },
    pickPiece: (id) => retain({ sel: [id] }),
