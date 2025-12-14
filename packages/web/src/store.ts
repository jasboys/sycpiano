import { castDraft, castImmutable, WritableDraft } from 'immer';
import { Atom, atom, getDefaultStore, WritableAtom } from 'jotai';

export type AtomMap<T> = {
    [K in keyof T]-?: Atom<T[K]>;
};

// type AllRequired<T> = {
//     [K in keyof T]-?: T[K];
// };

export type ReadWriteAtomMap<T, Arg extends unknown[]> = {
    [K in keyof T]-?: WritableAtom<T[K], [val: Arg], void>;
};

const typeSafeObjectFromEntries = <
    const T extends ReadonlyArray<readonly [PropertyKey, unknown]>,
>(
    entries: T,
): { [K in T[number] as K[0]]: K[1] } => {
    return Object.fromEntries(entries) as { [K in T[number] as K[0]]: K[1] };
};

const typeSafeObjectKeys = <T extends Record<PropertyKey, unknown>>(
    obj: T,
): [keyof T] => {
    return Object.keys(obj) as [keyof T];
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
                    console.log(key, val);
                    (draft[key] as T[K]) = val;
                });
            },
        );
    },
    toToggleAtom: <const K extends keyof T>(key: K) => {
        return atom(
            (get) => get(stateAtom)[key],
            (_get, set, val?: boolean) => {
                set(
                    stateAtom,
                    (draft) => ((draft[key] as boolean) = val ?? !draft[key]),
                );
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
