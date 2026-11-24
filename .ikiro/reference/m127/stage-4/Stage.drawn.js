
  // a pin's box sits REACH px from its anchor, away from the pane's centre, kept inside the pane
  const REACH = 104;
  const within = (value, edge, most) => Math.min(Math.max(value, edge), Math.max(edge, most - edge));
  const drawn = $derived(
    spots.flatMap((spot) => {
      const pin = pins.find((one) => one.id === spot.id);
      if (!pin) return [];
      const far = Math.hypot(spot.x - wide / 2, spot.y - tall / 2);
      const [ux, uy] = far ? [(spot.x - wide / 2) / far, (spot.y - tall / 2) / far] : [0, -1];
      return [{ ...spot, pin, bx: within(spot.x + ux * REACH, 80, wide), by: within(spot.y + uy * REACH, 28, tall) }];
    }),
  );
