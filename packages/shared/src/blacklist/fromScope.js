export default function fromScope({ blacklist, scope }) {
  const extractIds = (obj) => {
    if (obj.unit) {
      blacklist.units.push(obj.unit.id);
      extractIds(obj.unit);
    }

    if (obj.units && Array.isArray(obj.units)) {
      obj.units.forEach((unit) => {
        blacklist.units.push(unit.id);
        extractIds(unit);
      });
    }

    if (obj.tag) {
      blacklist.tags.push(obj.tag.id);
      extractIds(obj.tag);
    }

    if (obj.tags && Array.isArray(obj.tags)) {
      obj.tags.forEach((tag) => {
        blacklist.tags.push(tag.id);
        extractIds(tag);
      });
    }

    Object.keys(obj).forEach((key) => {
      if (["unit", "units", "tag", "tags"].includes(key)) return;
      if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
        extractIds(obj[key]);
      }
    });
  };

  extractIds(scope);
  return removeDuplicatesFromBlacklist(blacklist);
}

function removeDuplicatesFromBlacklist(blacklist) {
  if (blacklist.units && Array.isArray(blacklist.units)) {
    blacklist.units = Array.from(new Set(blacklist.units));
  }

  if (blacklist.tags && Array.isArray(blacklist.tags)) {
    blacklist.tags = Array.from(new Set(blacklist.tags));
  }

  if (blacklist.instructions && Array.isArray(blacklist.instructions)) {
    blacklist.instructions = Array.from(new Set(blacklist.instructions));
  }

  return blacklist;
}
