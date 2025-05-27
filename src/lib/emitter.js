export default class Emitter {
  constructor() {
    this.listeners = new Map();
  }

  on(name, ...listeners) {
    const list = this.listeners.get(name) || new Set();
    this.listeners.set(name, list);

    for (const listener of listeners) {
      list.add(listener)
    }
  }

  off(name, ...listeners) {
    for (const listener of listeners) {
      this.listeners.get(name)?.delete?.(listener)
    }
  }

  emit(name, ...args) {
    this.listeners.get(name)?.forEach?.(listener => {
      listener(...args);
    })
  }
}