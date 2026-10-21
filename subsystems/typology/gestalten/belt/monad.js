export const kleisli = (arrows) => (value) => {
  try {
    return Promise.resolve(arrows.reduce((carried, arrow) => (carried instanceof Promise ? carried.then(arrow) : arrow(carried)), value));
  } catch (error) {
    return Promise.reject(error);
  }
};

export const traverse = (inputs, arrow) => Promise.all(inputs.map(arrow));
