export class GameContext {
  constructor() {
    this.app = null;
    this.world = null;
    this.state = {
      gameStarted: false,
    };
    this.managers = new Map();
    this.systems = new Map();
    this.cleanups = [];
  }

  setApp(app) {
    this.app = app;
  }

  setWorld(world) {
    this.world = world;
    if (this.app) {
      // eslint-disable-next-line no-param-reassign
      this.app.world = world;
    }
  }

  registerManager(key, instance) {
    this.managers.set(key, instance);
    return instance;
  }

  getManager(key) {
    return this.managers.get(key);
  }

  registerSystem(key, instance) {
    this.systems.set(key, instance);
    return instance;
  }

  getSystem(key) {
    return this.systems.get(key);
  }

  attachCleanup(fn) {
    if (typeof fn === 'function') {
      this.cleanups.push(fn);
    }
  }

  dispose() {
    while (this.cleanups.length) {
      const fn = this.cleanups.pop();
      try {
        fn();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[GameContext] cleanup failed', err);
      }
    }
  }
}


