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

export const damerauLevenshtein = (a, b) => {
  const m = a.length,
    n = b.length;
  const dp = Array.from({ length: m + 2 }, () => Array(n + 2).fill(0));
  const maxDist = m + n;
  dp[0][0] = maxDist;
  for (let i = 0; i <= m; i++) {
    dp[i + 1][0] = maxDist;
    dp[i + 1][1] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j + 1] = maxDist;
    dp[1][j + 1] = j;
  }
  const last = {};
  for (let i = 1; i <= m; i++) {
    let db = 0;
    for (let j = 1; j <= n; j++) {
      const i1 = last[b[j - 1]] || 0;
      const j1 = db;
      const cost = a[i - 1] === b[j - 1] ? ((db = j), 0) : 1;
      dp[i + 1][j + 1] = Math.min(
        dp[i][j] + cost,
        dp[i + 1][j] + 1,
        dp[i][j + 1] + 1,
        dp[i1][j1] + (i - i1 - 1) + 1 + (j - j1 - 1),
      );
    }
    last[a[i - 1]] = i;
  }
  return dp[m + 1][n + 1];
};

export const hamming = (a, b) => {
  if (a.length !== b.length) throw new RangeError("strings must be equal length");
  let distance = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) distance++;
  return distance;
};

export const jaro = (a, b) => {
  if (a === b) return 1;
  const aLen = a.length,
    bLen = b.length;
  if (!aLen || !bLen) return 0;
  const range = Math.max(0, Math.floor(Math.max(aLen, bLen) / 2) - 1);
  const aMatches = Array(aLen).fill(false);
  const bMatches = Array(bLen).fill(false);
  let matches = 0,
    transpositions = 0;
  for (let i = 0; i < aLen; i++) {
    const lo = Math.max(0, i - range);
    const hi = Math.min(bLen - 1, i + range);
    for (let j = lo; j <= hi; j++) {
      if (bMatches[j] || a[i] !== b[j]) continue;
      aMatches[i] = bMatches[j] = true;
      matches++;
      break;
    }
  }
  if (!matches) return 0;
  let k = 0;
  for (let i = 0; i < aLen; i++) {
    if (!aMatches[i]) continue;
    while (!bMatches[k]) k++;
    if (a[i] !== b[k]) transpositions++;
    k++;
  }
  return (matches / aLen + matches / bLen + (matches - transpositions / 2) / matches) / 3;
};

export const jaroWinkler = (a, b, prefixScale = 0.1) => {
  const j = jaro(a, b);
  let prefix = 0;
  for (let i = 0; i < Math.min(a.length, b.length, 4); i++) {
    if (a[i] === b[i]) prefix++;
    else break;
  }
  return j + prefix * prefixScale * (1 - j);
};

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
