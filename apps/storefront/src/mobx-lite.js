/**
 * Минимальная реализация MobX-паттерна без внешних зависимостей.
 * API намеренно совпадает с MobX: makeAutoObservable, observer, useStores.
 */

export function makeAutoObservable(target) {
  const listeners = new Set();
  let version = 0;

  const proxy = new Proxy(target, {
    set(obj, prop, value) {
      obj[prop] = value;
      // Не триггерим ре-рендер для служебных полей (_ и __)
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
