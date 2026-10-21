export const nearest = (renderable) => (renderable === null ? "default" : renderable.cursor ?? nearest(renderable.parent));

export const pointer = (renderer) => {
  renderer.root.onMouseOut = () => renderer.setMousePointer("default");
  renderer.root.onMouseOver = (event) => renderer.setMousePointer(nearest(event.target));
};
