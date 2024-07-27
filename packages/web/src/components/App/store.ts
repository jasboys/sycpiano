import { GLOBAL_QUERIES } from 'src/screens';
import type { MediaQueryStateShape } from 'src/types';
import { zustandMiddlewareOptions } from 'src/utils';
import { createStore } from 'zustand-x';

const defaultMedia = Object.fromEntries(
    (Object.keys(GLOBAL_QUERIES) as (keyof typeof GLOBAL_QUERIES)[]).map(
        (k) => [k, false],
    ) as Iterable<readonly [keyof MediaQueryStateShape, boolean]>,
) as MediaQueryStateShape;

export const mediaQueriesStore = createStore('mediaQueries')(
    defaultMedia,
    zustandMiddlewareOptions,
).extendActions((set, _get, _api) => ({
    matches: (matches: MediaQueryStateShape) => {
        set.state((state) => {
            return {
                ...state,
                ...matches,
            };
        });
    },
}));

type SelectorMapEntriesType = Iterable<
    readonly [
        keyof MediaQueryStateShape,
        (state: MediaQueryStateShape) => boolean,
    ]
>;
type SelectorMapType = Record<
    keyof MediaQueryStateShape,
    (state: MediaQueryStateShape) => boolean
>;

export const mqSelectors = Object.fromEntries(
    (Object.keys(GLOBAL_QUERIES) as (keyof MediaQueryStateShape)[]).map((k) => [
        k,
        (mqState) => mqState[k],
    ]) as SelectorMapEntriesType,
) as SelectorMapType;
