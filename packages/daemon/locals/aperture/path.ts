export function normalize(path: string): string {
  if (!path.startsWith("/")) {
    path = "/" + path;
  }
  
  return path.endsWith("/") && path.length > 1 
    ? path.slice(0, -1) 
    : path;
}

export function joinPaths(base: string, path: string): string {
  if (!base) return path;
  if (!path) return base;
  
  return `${base.endsWith("/") ? base.slice(0, -1) : base}${
    path.startsWith("/") ? path : "/" + path
  }`;
}
