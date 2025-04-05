export default 
//   blacklist = { units: [], tags: [], queue: [], ...blacklist };
//   const extractIds = (obj) => {
//     if (obj.unit) {
//       blacklist.units.push(obj.unit.id);
//       extractIds(obj.unit);
//     }

//     if (obj.units && Array.isArray(obj.units)) {
//       obj.units.forEach((unit) => {
//         blacklist.units.push(unit.id);
//         extractIds(unit);
//       });
//     }

//     if (obj.tag) {
//       blacklist.tags.push(obj.tag.id);
//       extractIds(obj.tag);
//     }

//     if (obj.tags && Array.isArray(obj.tags)) {
//       obj.tags.forEach((tag) => {
//         blacklist.tags.push(tag.id);
//         extractIds(tag);
//       });
//     }

//     if (obj.queue) {
//       if (obj.queue.id) blacklist.queue.push(obj.queue.id);
//     }

//     Object.keys(obj).forEach((key) => {
//       if (["unit", "units", "tag", "tags", "queue"].includes(key)) return;
//       if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
//         extractIds(obj[key]);
//       }
//     });
//   };
//   if (scope) extractIds(scope);
//   return removeDuplicatesFromBlacklist(blacklist);
// }

// function removeDuplicatesFromBlacklist(blacklist) {
//   if (blacklist.units && Array.isArray(blacklist.units)) {
//     blacklist.units = Array.from(new Set(blacklist.units));
//   }

//   if (blacklist.tags && Array.isArray(blacklist.tags)) {
//     blacklist.tags = Array.from(new Set(blacklist.tags));
//   }

//   if (blacklist.queue && Array.isArray(blacklist.queue)) {
//     blacklist.queue = Array.from(new Set(blacklist.queue));
//   }

//   return blacklist;
// }
