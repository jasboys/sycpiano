import { atom } from 'jotai';
import { GLOBAL_QUERIES } from 'src/screens';
import { toAtoms } from 'src/store';
import type { MediaQueryStateShape } from 'src/types';

const defaultMedia = Object.fromEntries(
    (Object.keys(GLOBAL_QUERIES) as (keyof typeof GLOBAL_QUERIES)[]).map(
        (k) => [k, false],
    ) as Iterable<readonly [keyof MediaQueryStateShape, boolean]>,
) as MediaQueryStateShape;

export const mediaQueriesBaseAtom = atom(defaultMedia);
export const mediaQueriesAtoms = toAtoms(mediaQueriesBaseAtom);
export const mediaQueriesMatch = atom(
    null,
    (_get, set, update: MediaQueryStateShape) => {
        set(mediaQueriesBaseAtom, (prev) => ({ ...prev, ...update }));
    },
);

// export const mediaQueriesStore = createStore('mediaQueries')(
//     defaultMedia,
//     zustandMiddlewareOptions,
// ).extendActions((set, _get, _api) => ({
//     matches: (matches: MediaQueryStateShape) => {
//         set.state((state) => {
//             return {
//                 ...state,
//                 ...matches,
//             };
//         });
//     },
// }));

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
