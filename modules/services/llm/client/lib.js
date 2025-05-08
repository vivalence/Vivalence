import { sleep } from "@vivalence/shared";

export const isNonRetryableError = (error) => {
  if (
    error.message?.includes("auth") ||
    error.message?.includes("key") ||
    error.message?.includes("invalid")
  ) {
    return true;
  }
  return false;
};

export const withRetry = async (fn, config = {}) => {
  const { maxRetries = 3, initialDelay = 1000, maxDelay = 10000 } = config;

  let delay = initialDelay;
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      console.warn(
        `LLM request failed (attempt ${attempt + 1}/${maxRetries}):`,
        error.message,
      );

      if (isNonRetryableError(error)) {
        console.error(
          "Non-retryable error, aborting retry sequence:",
          error.message,
        );
        throw error;
      }

      if (attempt === maxRetries - 1) break;

      await sleep(delay);
      delay = Math.min(delay * 2, maxDelay);
    }
  }

  throw lastError;
};
