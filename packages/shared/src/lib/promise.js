import { array, sleep } from "./index.js";

async function chunked(promises, CHUNK_SIZE, log = false) {
  const executions = [];
  const chunkTimings = [];
  let chunkIndex = 0;
  const batchCount = Math.floor(promises.length / CHUNK_SIZE);
  const startTimeTotal = performance.now();

  log &&
    console.log(
      "executed chunked [chunks] [total]:",
      batchCount,
      promises.length,
    );

  for (const chunk of array.chunk(promises, CHUNK_SIZE)) {
    const startTimeChunk = performance.now();

    executions.push(await Promise.all(chunk.map((p) => p())));

    await sleep(0.5);

    const endTimeChunk = performance.now();
    const chunkDuration = endTimeChunk - startTimeChunk;
    chunkTimings.push(chunkDuration);

    log &&
      console.log(
        `chunk ${chunkIndex}/${batchCount} finished - items: ${executions.flat().length}/${promises.length}, time: ${chunkDuration.toFixed(2)}ms`,
      );

    chunkIndex++;
  }

  const endTimeTotal = performance.now();
  const totalDuration = endTimeTotal - startTimeTotal;

  log &&
    console.log(
      "executed [chunks] [total]:",
      executions.length,
      executions.flat().length,
    );
  log && console.log("performance summary:");
  log && console.log(`- total time: ${totalDuration.toFixed(2)}ms`);
  log &&
    console.log(
      `- average chunk time: ${(chunkTimings.reduce((a, b) => a + b, 0) / chunkTimings.length).toFixed(2)}ms`,
    );
  log &&
    console.log(
      `- per item time: ${(totalDuration / executions.flat().length).toFixed(2)}ms`,
    );
  log &&
    console.log(
      `- throughput: ${(executions.length / (totalDuration / 1000)).toFixed(2)} items/second`,
    );

  return executions;
}
async function linear(promises, log = false) {
  const installations = [];
  const startTimeTotal = performance.now();
  log && console.log("installing linear [total]:", promises.length);

  const batchTimings = [];
  let batchStartTime = performance.now();

  for (let i = 0; i < promises.length; i++) {
    const result = await promises[i]();
    installations.push(result);

    // Only log every 100 items or on the last item
    if ((i + 1) % log === 0 || i === promises.length - 1) {
      const batchEndTime = performance.now();
      const batchDuration = batchEndTime - batchStartTime;
      batchTimings.push(batchDuration);

      log &&
        console.log(
          `batch progress - items: ${installations.length}/${promises.length}, ` +
            `last ${installations.length % log || log} items: ${batchDuration.toFixed(2)}ms, ` +
            `last status: ${result.status}, operation: ${result.operation}`,
        );

      // Reset batch timer for the next batch
      batchStartTime = performance.now();
    }
  }

  const endTimeTotal = performance.now();
  const totalDuration = endTimeTotal - startTimeTotal;

  log && console.log("\nPerformance Summary:");
  log && console.log(`- total time: ${totalDuration.toFixed(2)}ms`);
  log && console.log(`- batches processed: ${batchTimings.length}`);
  log &&
    console.log(
      `- average batch time: ${(batchTimings.reduce((a, b) => a + b, 0) / batchTimings.length).toFixed(2)}ms`,
    );
  log &&
    console.log(
      `- per item time: ${(totalDuration / installations.length).toFixed(2)}ms`,
    );
  log &&
    console.log(
      `- throughput: ${(installations.length / (totalDuration / 1000)).toFixed(2)} items/second`,
    );

  return installations;
}

export default { chunked, linear };
