import type { WritableDraft } from 'immer';
import { type Atom, atom, getDefaultStore, type WritableAtom } from 'jotai';

export type AtomMap<T> = {
    [K in keyof T]-?: Atom<T[K]>;
};

// type AllRequired<T> = {
//     [K in keyof T]-?: T[K];
// };

export type ReadWriteAtomMap<T, Arg extends unknown[]> = {
    [K in keyof T]-?: WritableAtom<T[K], [val: Arg], void>;
};

type AtomWithImmer<T> = WritableAtom<
    T,
    [T | ((draft: WritableDraft<T>) => void)],
    void
>;

export const toAtoms = <T extends {}, const K extends keyof T>(
    stateAtom: Atom<T>,
): AtomMap<T> => {
    return Object.keys(getDefaultStore().get(stateAtom)).reduce(
        (prev, k) => {
            const key = k as K;
            return {
                // biome-ignore lint/performance/noAccumulatingSpread: Need it.
                ...prev,
                [key]: atom((get) => get(stateAtom)[key]),
            };
        },
        {} as AtomMap<T>,
    );
};

export const partialAtomGetter = <T>(stateAtom: AtomWithImmer<T>) => ({
    toWriteAtom: <const K extends keyof T>(key: K) => {
        return atom(
            (get) => get(stateAtom)[key],
            (_get, set, val: T[K]) => {
                set(stateAtom, (draft) => {
                    (draft[key as keyof typeof draft] as T[K]) = val;
                });
            },
        );
    },
    toToggleAtom: <const K extends keyof T>(key: K) => {
        return atom(
            (get) => get(stateAtom)[key],
            (_get, set, val?: boolean) => {
                set(stateAtom, (draft) => {
                    (draft[key as keyof typeof draft] as boolean) =
                        val ?? !draft[key as keyof typeof draft];
                });
            },
        );
    },
});

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
