export function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

// Usage example:
// await sleep(2); // Pauses execution for 2 seconds
