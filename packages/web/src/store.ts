import { create, type StoreApi, type UseBoundStore } from 'zustand';
import { navBarStore } from './components/App/NavBar/store.js';
import { mediaQueriesStore } from './components/App/store.js';
import { cartStore } from './components/Cart/store.js';
import { shopStore } from './components/Shop/ShopList/store.js';
import { atom, Atom } from 'jotai';
import { getDefaultStore } from 'jotai';

export type AtomMap<T> = {
    [K in keyof T]: Atom<T[K]>;
};

export const toAtoms = <T extends {}>(stateAtom: Atom<T>) => {
    return Object.keys(getDefaultStore().get(stateAtom)).reduce(
        (prev, k) => {
            const key = k as keyof T;
            return {
                ...prev,
                [key]: atom((get) => get(stateAtom)[key]),
            };
        },
        {} as AtomMap<T>,
    );
};

// export const rootStore = {
//     cart: cartStore,
//     navBar: navBarStore,
//     shop: shopStore,
//     mediaQueries: mediaQueriesStore,
// };

// type WithSelectors<S> = S extends { getState: () => infer T }
//     ? S & { use: { [K in keyof T]: () => T[K] } }
//     : never;

// export const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
//     _store: S,
// ) => {
//     const store = _store as WithSelectors<typeof _store>;
//     store.use = {};
//     for (const k of Object.keys(store.getState())) {
//         (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
//     }

//     return store;
// };

// export const useBoundStore = create((...a) => ({
//     ...
// }))

// export const useStore = () => mapValuesKey('use', rootStore);

// // Global tracked hook selectors
// export const useTrackedStore = () => mapValuesKey('useTracked', rootStore);

// // Global getter selectors
// export const store = mapValuesKey('get', rootStore);

// // Global actions
// export const actions = mapValuesKey('set', rootStore);
