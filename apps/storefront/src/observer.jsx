import { createContext, useContext, useSyncExternalStore } from 'react';

// ---------- observer ----------

/**
 * Оборачивает компонент, заставляя его ре-рендериться при изменении любого store.
 * Принимает один или несколько store-ов как второй аргумент.
 *
 * Использование:
 *   const MyComponent = observer(({ store }) => { ... }, () => [store]);
 *
 * Или без явного списка — тогда observer следит за стором из useStores.
 */
export function observer(Component) {
  function ObservedComponent(props) {
    // Мы не знаем заранее, какие сторы использует компонент,
    // поэтому подписываемся на все сторы из контекста.
    const stores = useContext(StoreContext);

    // Подписываемся на каждый стор через useSyncExternalStore
    Object.values(stores).forEach((store) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      useSyncExternalStore(store.__subscribe, store.__getSnapshot);
    });

    return Component(props);
  }

  ObservedComponent.displayName = `observer(${Component.displayName || Component.name || 'Component'})`;
  return ObservedComponent;
}

// ---------- StoreContext ----------

export const StoreContext = createContext({});

export function StoreProvider({ stores, children }) {
  return (
    <StoreContext.Provider value={stores}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStores() {
  return useContext(StoreContext);
}
