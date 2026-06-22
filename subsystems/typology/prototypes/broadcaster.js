import { object, promise, sleep } from "@vivalence/typology"

export class Broadcaster {
  _subscribers = new Set()

  subscribe(filter = {}, options = {}) {
    const queue = []
    const gate = promise.waiter()
    let closed = false
    const timeout = options.timeout ?? 0

    const subscription = {
      filter,
      push(event) {
        if (closed) return
        queue.push(event)
        gate.wake()
      },
      close() {
        closed = true
        gate.wake()
      },
      [Symbol.asyncIterator]() {
        return {
          async next() {
            while (true) {
              if (queue.length > 0) return { value: queue.shift(), done: false }
              if (closed) return { value: undefined, done: true }
              const cutoff = timeout > 0 ? sleep.signal(timeout) : undefined
              await gate.wait(cutoff)
              if (cutoff?.aborted) {
                closed = true
                return { value: undefined, done: true }
              }
              // woken by push (queue now has it) or close (loop re-checks); a spurious
              // wake just re-suspends — never a premature done.
            }
          },
          return() {
            closed = true
            gate.wake() // unblock a suspended next() (fixes the prior hang)
            return Promise.resolve({ value: undefined, done: true })
          },
        }
      },
    }

    this._subscribers.add(subscription)
    const unsubscribe = () => {
      subscription.close()
      this._subscribers.delete(subscription)
    }
    return { iterable: subscription, unsubscribe }
  }

  push(event, entity) {
    for (const sub of this._subscribers) {
      if (Object.keys(sub.filter).length === 0 || object.match(entity, sub.filter)) {
        sub.push(event)
      }
    }
  }
}
