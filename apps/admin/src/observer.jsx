import { createContext, useContext, useSyncExternalStore } from 'react';

export function observer(Component) {
  function ObservedComponent(props) {
    
    
    const stores = useContext(StoreContext);

    
    Object.values(stores).forEach((store) => {
      
      useSyncExternalStore(store.__subscribe, store.__getSnapshot);
    });

    return Component(props);
  }

  ObservedComponent.displayName = `observer(${Component.displayName || Component.name || 'Component'})`;
  return ObservedComponent;
}

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
