import { object } from "@vivalence/typology"

export class Broadcaster {
  _subscribers = new Set()

  subscribe(filter = {}, options = {}) {
    const queue = []
    let waiting = null
    let closed = false
    const timeout = options.timeout ?? 0

    const subscription = {
      filter,
      push(event) {
        if (closed) return
        if (waiting) {
          const resolve = waiting
          waiting = null
          resolve({ value: event, done: false })
        } else {
          queue.push(event)
        }
      },
      close() {
        closed = true
        if (waiting) {
          waiting({ value: undefined, done: true })
          waiting = null
        }
      },
      [Symbol.asyncIterator]() {
        return {
          next() {
            if (queue.length > 0) {
              return Promise.resolve({ value: queue.shift(), done: false })
            }
            if (closed) {
              return Promise.resolve({ value: undefined, done: true })
            }
            return new Promise((resolve) => {
              waiting = resolve
              if (timeout > 0) {
                setTimeout(() => {
                  if (waiting === resolve) {
                    waiting = null
                    resolve({ value: undefined, done: true })
                  }
                }, timeout)
              }
            })
          },
          return() {
            closed = true
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
