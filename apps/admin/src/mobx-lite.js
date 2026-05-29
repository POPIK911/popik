export function makeAutoObservable(target) {
  const listeners = new Set();
  let version = 0;

  const proxy = new Proxy(target, {
    set(obj, prop, value) {
      obj[prop] = value;
      
      if (!String(prop).startsWith('_')) {
        version += 1;
        listeners.forEach((fn) => fn());
      }
      return true;
    },
  });

  proxy.__subscribe = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  proxy.__getSnapshot = () => version;

  return proxy;
}
