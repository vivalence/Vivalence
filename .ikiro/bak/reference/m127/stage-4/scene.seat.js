  // a placement's seat: its parent's frame times its own TRS. `base` is where explode starts from
  const seat = (group, at) => {
    const matrix = new THREE.Matrix4().fromArray(at.parentMatrix ?? IDENTITY);
    const local = new THREE.Matrix4().compose(
      new THREE.Vector3().fromArray(numbers(at.translation, 3) ?? [0, 0, 0]),
      new THREE.Quaternion().fromArray(numbers(at.rotation, 4) ?? [0, 0, 0, 1]),
      new THREE.Vector3().fromArray(numbers(at.scale, 3) ?? [1, 1, 1]),
    );
    matrix.clone().multiply(local).decompose(group.position, group.quaternion, group.scale);
    group.userData.inverse = matrix.clone().invert();
    group.userData.base = group.position.clone();
  };

