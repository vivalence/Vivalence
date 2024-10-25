// Import the format function from Deno standard library
import { format } from "https://deno.land/std/datetime/mod.ts";

// Function to format bytes to a human-readable string
const formatBytes = (bytes) => {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

// Function to log current memory usage
const logMemoryUsage = () => {
  const usage = Deno.memoryUsage();
  const timestamp = format(new Date(), "yyyy-MM-dd HH:mm:ss");

  console.log(`[${timestamp}] Memory Usage:`);
  console.log(`  RSS: ${formatBytes(usage.rss)}`);
  console.log(`  Heap Total: ${formatBytes(usage.heapTotal)}`);
  console.log(`  Heap Used: ${formatBytes(usage.heapUsed)}`);
  console.log(`  External: ${formatBytes(usage.external)}`);
  console.log("------------------------");
};

// Function to create a memory profiler
const createMemoryProfiler = (intervalMs = 5000) => {
  let intervalId = null;

  const start = () => {
    if (intervalId !== null) {
      console.log("Memory profiler is already running.");
      return;
    }

    logMemoryUsage();
    intervalId = setInterval(logMemoryUsage, intervalMs);
    console.log(`Memory profiler started. Sampling every ${intervalMs}ms.`);
  };

  const stop = () => {
    if (intervalId === null) {
      console.log("Memory profiler is not running.");
      return;
    }

    clearInterval(intervalId);
    intervalId = null;
    console.log("Memory profiler stopped.");
  };

  return { start, stop };
};

export default createMemoryProfiler;
