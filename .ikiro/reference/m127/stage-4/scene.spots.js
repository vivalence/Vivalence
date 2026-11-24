  // where each pin's anchor falls on the pane: the centre of the pieces it names plus its offset, or its
  // fixed point. a pin none of whose pieces is drawn, or behind the camera, has no spot
  const spots = () => {
    const { width, height } = container.getBoundingClientRect();
    return S.pins.flatMap((pin) => {
      const box = new THREE.Box3();
      for (const group of groups.values()) {
        if (group.visible && pin.literals.includes(group.userData.slug)) box.expandByObject(group);
      }
      if (!pin.position && box.isEmpty()) return [];
      const at = pin.position
        ? new THREE.Vector3().fromArray(pin.position)
        : box.getCenter(new THREE.Vector3()).add(new THREE.Vector3().fromArray(pin.offset ?? [0, 0, 0]));
      const c = at.project(camera);
      if (c.z >= 1) return [];
      return [{ id: pin.id, x: ((c.x + 1) / 2) * width, y: ((1 - c.y) / 2) * height }];
    });
  };

