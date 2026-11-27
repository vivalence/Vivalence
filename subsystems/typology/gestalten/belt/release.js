const RELEASE = /^\d+\.\d+\.\d+$/;

export const parse = (release) => {
  if (!RELEASE.test(release)) throw new Error(`not a release: ${release}`);
  return release.split(".").map(Number);
};

export const compare = (left, right) =>
  left.map((part, index) => part - right[index]).find((gap) => gap !== 0) ?? 0;
