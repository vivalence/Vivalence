const addListener = (events, event, listener) => {
    const newEvents = new Map(events);
    const listeners = newEvents.get(event) || new Set();
    newEvents.set(event, new Set(listeners).add(listener));
    return newEvents;
};

const removeListener = (events, event, listener) => {
    const newEvents = new Map(events);
    const listeners = newEvents.get(event);
    if (listeners) {
        const newListeners = new Set(listeners);
        newListeners.delete(listener);
        if (newListeners.size === 0) newEvents.delete(event);
        else newEvents.set(event, newListeners);
    }
    return newEvents;
};

const createBaseEmitter = () => {
    let events = new Map();

    return {
        on: (event, listener) => {
            events = addListener(events, event, listener);
        },
        emit: (event, ...args) => {
            const listeners = events.get(event);
            if (listeners) {
                listeners.forEach((listener) => listener(...args));
            }
        },
        removeAllListeners: (event) => {
            if (event) {
                events.delete(event);
            } else {
                events.clear();
            }
        }
        // removeListener: (event, listener) => {events = removeListener(events, event, listener);},
        // listenerCount: (event) => events.get(event)?.size || 0
    };
};

const withSecurityAndScoping = (emitter, securityRules) => {
    const scopedEmitter = (scope) => ({
        on: (event, listener) => {
            const [domain, e] = event.split(":");
            if (!!e && securityRules(scope, domain)) {
                emitter.on(`${event}`, listener);
            } else {
                emitter.emit("emitter.security.attempted-violation", { scope, event });
            }
        },
        emit: (event, ...args) => emitter.emit(`${scope}:${event}`, ...args)
    });

    return {
        ...emitter,
        scope: scopedEmitter
    };
};

const createSecureEventEmitter = () => {
    const emitter = createBaseEmitter();
    const csr = (r) => (ls, es) => r[ls]?.includes(es) || ls === es || false;
    const defaultRules = {
        "@games": [],
        "@strategy": ["@ontology", "@games"],
        "@corpus": ["@ontology", "@games", "@strategy"],
        "@ontology": ["@corpus", "@games"]
    };
    const securityRules = csr(defaultRules);
    return withSecurityAndScoping(emitter, securityRules);
};

export default createSecureEventEmitter;

// class EventEmitter {private listeners: { [event: string]: Function[] } = {}; on(event: string, listener: Function): void {if (!this.listeners[event]) {this.listeners[event] = [];} this.listeners[event].push(listener);} emit(event: string, ...args: any[]): void {if (this.listeners[event]) {this.listeners[event].forEach((listener) => listener(...args));}} removeListener(event: string, listenerToRemove: Function): void {if (this.listeners[event]) {this.listeners[event] = this.listeners[event].filter((listener) => listener !== listenerToRemove);}} removeAllListeners(event?: string): void {if (event) {delete this.listeners[event];} else {this.listeners = {};}} once(event: string, listener: Function): void {const onceWrapper = (...args: any[]) => {listener(...args); this.removeListener(event, onceWrapper);}; this.on(event, onceWrapper);} listenerCount(event: string): number {return this.listeners[event] ? this.listeners[event].length : 0;}} const createSecurityRules = () => {const canListen = (listenerScope, eventScope) => {const rules = {"@games": [], "@strategy": ["@ontology", "@games"], "@corpus": ["@ontology", "@games", "@strategy"], "@ontology": ["@corpus", "@games"]}; return rules[listenerScope]?.includes(eventScope) || false;}; return { canListen };}; bus.createScoped = (scope) => {return {on: (event, handler) => {const [domain] = event.split(":"); if (security.canListen(scope, domain || scope)) {bus.on(event, handler);} else {console.warn(`Security: ${scope} not allowed to listen to ${event}`);}}, emit: (event, data) => {const fullEvent = `${scope}:${event}`; bus.emit(fullEvent, data);}};}; export default SecureEventEmitter;
