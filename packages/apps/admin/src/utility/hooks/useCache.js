import { useState, useEffect } from "react";

const MAX_AGE = 1000 * 60 * 60 * 24; // 24 hours
const cache = new Map();

export const useCache = (key, fetchFunc) => {
  const [data, setData] = useState(() => {
    const cacheEntry = cache.get(key);
    if (cacheEntry && new Date() - cacheEntry.time < MAX_AGE) {
      return cacheEntry.data;
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(!cache.has(key));
  const [error, setError] = useState(undefined);

  useEffect(() => {
    if (!cache.has(key) || new Date() - cache.get(key).time >= MAX_AGE) {
      setIsLoading(true);
      fetchFunc()
        .then((newData) => {
          cache.set(key, { data: newData, time: new Date() });
          setData(newData);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err);
          setIsLoading(false);
        });
    }
  }, [key, fetchFunc]);

  return [data, isLoading, error];
};
