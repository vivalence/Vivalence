export const clean = (s) =>
  s
    .toLowerCase()
    .replace(/[?.!,;:'"'´`~\-—]/g, "")
    .trim();

export const fold = (s) => clean(s.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));

export const separate = (s) =>
  s
    .split("/")
    .map((a) => a.replace(/\(.*?\)/g, "").trim())
    .filter(Boolean);

export function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

export function levenshtein(a, b) {
  const m = a.length,
    n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i]);
  for (let j = 1; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

export const cosine = (a, b) => {
  const freqs = (str) => {
    const map = {};
    for (let i = 0; i < str.length - 1; i++) {
      const bigram = str.slice(i, i + 2);
      map[bigram] = (map[bigram] || 0) + 1;
    }
    return map;
  };
  const fa = freqs(a),
    fb = freqs(b);
  const keys = new Set([...Object.keys(fa), ...Object.keys(fb)]);
  let dot = 0,
    magA = 0,
    magB = 0;
  for (const key of keys) {
    const va = fa[key] || 0,
      vb = fb[key] || 0;
    dot += va * vb;
    magA += va * va;
    magB += vb * vb;
  }
  return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
};

export const similarity = (a, b) => {
  const max = Math.max(a.length, b.length);
  return max === 0 ? 1 : 1 - levenshtein(a, b) / max;
};

export const dice = (a, b) => {
  if (a === b) return 1;
  const sa = new Set(a);
  const sb = new Set(b);
  if (!sa.size || !sb.size) return 0;
  let shared = 0;
  for (const c of sa) if (sb.has(c)) shared++;
  return (2 * shared) / (sa.size + sb.size);
};
