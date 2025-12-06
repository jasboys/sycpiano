import type { StoreApi, UseBoundStore } from 'zustand';
import { navBarStore } from './components/App/NavBar/store.js';
import { mediaQueriesStore } from './components/App/store.js';
import { cartStore } from './components/Cart/store.js';
import { shopStore } from './components/Shop/ShopList/store.js';

export const rootStore = {
    cart: cartStore,
    navBar: navBarStore,
    shop: shopStore,
    mediaQueries: mediaQueriesStore,
};

type WithSelectors<S> = S extends { getState: () => infer T }
    ? S & { use: { [K in keyof T]: () => T[K] } }
    : never;

export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
    _store: S,
) => {
    const store = _store as WithSelectors<typeof _store>;
    store.use = {};
    for (const k of Object.keys(store.getState())) {
        (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
    }

    return store;
};

// export const useStore = () => mapValuesKey('use', rootStore);

// // Global tracked hook selectors
// export const useTrackedStore = () => mapValuesKey('useTracked', rootStore);

// // Global getter selectors
// export const store = mapValuesKey('get', rootStore);

// // Global actions
// export const actions = mapValuesKey('set', rootStore);
