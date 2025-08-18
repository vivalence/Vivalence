import Monad from "./basic.js";

const Result = {
  // Core Result type constructors
  of: (value) => ({
    ...Monad.of(value),
    type: "success",
    isSuccess: () => true,
    isFailure: () => false,
    fold: (onFailure, onSuccess) => onSuccess(value),
  }),

  success: (value) => Result.of(value),

  failure: (error) => ({
    ...Monad.of(error),
    type: "failure",
    isSuccess: () => false,
    isFailure: () => true,
    map: () => Result.failure(error),
    chain: () => Result.failure(error),
    fold: (onFailure, onSuccess) => onFailure(error),
  }),

  // Utility functions
  fromNullable: (value) =>
    value != null ? Result.success(value) : Result.failure(new Error("Value is null or undefined")),

  tryCatch: (f) => {
    try {
      return Result.success(f());
    } catch (e) {
      return Result.failure(e);
    }
  },

  all: (results) => {
    const successes = results.filter((r) => r.isSuccess());
    return successes.length === results.length
      ? Result.success(successes.map((s) => s.run()))
      : Result.failure(results.find((r) => r.isFailure()).run());
  },

  // Additional utility functions
  fromPromise: async (promise) => {
    try {
      return Result.success(await promise);
    } catch (e) {
      return Result.failure(e);
    }
  },

  // Lifts a function into the Result context
  lift:
    (f) =>
    (...args) =>
      Result.tryCatch(() => f(...args)),

  // Convert a Result to Either-like structure
  toEither: (result) => ({
    left: result.isFailure() ? result.run() : null,
    right: result.isSuccess() ? result.run() : null,
  }),
};

// Helper functions
const tryCatchAsync = async (f) => {
  try {
    return Result.success(await f());
  } catch (e) {
    return Result.failure(e);
  }
};

const resultify =
  (f) =>
  (...args) => {
    try {
      const result = f(...args);
      return result instanceof Promise
        ? result.then(Result.success).catch(Result.failure)
        : Result.success(result);
    } catch (e) {
      return Result.failure(e);
    }
  };

const traverse = (arr, f) => Result.all(arr.map(f));

const sequence = Result.all;

// Extension methods for working with Results
const ResultOps = {
  // Applicative operation
  ap: (resultF, resultV) => resultF.chain((f) => resultV.map(f)),

  // Combine two results with a function
  combine: (resultA, resultB, f) => resultA.chain((a) => resultB.map((b) => f(a, b))),

  // Filter a result based on predicate
  filter: (result, pred) =>
    result.chain((x) =>
      pred(x) ? Result.success(x) : Result.failure(new Error("Predicate not satisfied")),
    ),

  // Recovery methods
  recover: (result, f) => (result.isFailure() ? Result.tryCatch(() => f(result.run())) : result),

  recoverWith: (result, f) => (result.isFailure() ? f(result.run()) : result),
};

// Example usage:
const example = () => {
  // Basic usage
  const success = Result.success(42)
    .map((x) => x * 2)
    .chain((x) => Result.success(x + 1))
    .fold(
      (err) => console.error(err),
      (val) => console.log(val),
    );

  // Error handling
  const computation = Result.tryCatch(() => {
    throw new Error("Something went wrong");
  })
    .orElse((err) => Result.success("recovered"))
    .fold(
      (err) => console.error(err),
      (val) => console.log(val),
    );

  // Async operations
  const asyncOp = async () => {
    const result = await tryCatchAsync(async () => {
      const response = await fetch("https://api.example.com");
      return response.json();
    });

    return result
      .map((data) => processData(data))
      .fold(
        (err) => handleError(err),
        (val) => handleSuccess(val),
      );
  };
};

export { Result, ResultOps, tryCatchAsync, resultify, traverse, sequence };
