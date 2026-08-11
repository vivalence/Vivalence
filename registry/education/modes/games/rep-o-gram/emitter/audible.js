export const audible = (daemon, literal) => {
  const asset = literal?.trait?.VOCALIZED?.asset;
  if (!asset) return false;
  if (asset.path) return Boolean(daemon.cargo[asset.path]);
  if (asset.slug)
    return Object.keys(daemon.cargo).some(
      (key) => key.endsWith("/" + asset.slug) || key.startsWith(asset.slug),
    );
  return false;
};
