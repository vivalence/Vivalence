export function basedId(content) {
  let hash = 0;
  const str = JSON.stringify(content);
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

export function timedId() {
  const now = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${now.toString(36)}${random.toString(36)}`;
}

export function id(content) {
  return content ? basedId(content) : timedId();
}
