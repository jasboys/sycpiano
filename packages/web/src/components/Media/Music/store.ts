import type { QueryObserverResult } from '@tanstack/react-query';
import axios from 'axios';
import { atom, type WritableAtom } from 'jotai';
import { atomWithImmer } from 'jotai-immer';
import { atomWithQuery } from 'jotai-tanstack-query';
import { compact, shuffle, sortBy } from 'lodash-es';
import {
    isMusicItem,
    type MusicCategories,
    type MusicFileItem,
    type MusicItem,
    type MusicListItem,
    type MusicResponse,
    type MusicStateShape,
} from 'src/components/Media/Music/types';
import { partialAtomGetter, toAtoms } from 'src/store.js';
import { getLastName, modulo, normalizeString } from './utils.js';

const initialState: MusicStateShape = {
    isFetching: false,
    items: [],
    flatItems: [],
    isPlaying: false,
    volume: 0.0,
    playbackPosition: 0.0,
    lastUpdateTimestamp: 0,
    duration: -1,
    currentTrack: undefined,
    isLoading: false,
    isShuffle: false,
    isHoverSeekring: false,
    isMouseMove: false,
    angle: undefined,
    radii: {
        inner: 0,
        outer: 0,
        base: 0,
    },
};

const musicListIfExists = (
    response: MusicResponse,
    category: MusicCategories,
    sortByDate = false,
) => {
    if (!response[category]) {
        return [];
    }
    const curr = sortByDate
        ? response[category].sort((a, b) =>
              a.year && b.year
                  ? b.year - a.year
                  : a.piece.localeCompare(b.piece),
          )
        : response[category];
    if (curr !== undefined && curr.length !== 0) {
        return [{ type: category, id: category }, ...curr];
    }
    return [];
};

const fetchPlaylistFn = async () => {
    const { data: response } = await axios.get<MusicResponse>('/api/music');
    const mappedResponse: MusicResponse = {};
    for (const category in response) {
        mappedResponse[category] = response[category].map((musicItem) => {
            const mappedFiles = musicItem.musicFiles.map((musicFile) => {
                const mappedFile = {
                    ...musicFile,
                    piece: musicItem.piece,
                    composer: musicItem.composer,
                    contributors: musicItem.contributors,
                    year: musicItem.year,
                };
                // flatItems.push(mappedFile);
                return mappedFile;
            });
            return {
                ...musicItem,
                musicFiles: mappedFiles,
            };
        });
    }

    const moreConcerti: MusicItem = {
        composer:
            'For more recordings of concerti, please contact Sean Chen directly',
        piece: '',
        id: 'more_concerti',
        musicFiles: [],
        type: 'concerto',
    };
    if (mappedResponse.concerto === undefined) {
        mappedResponse.concerto = [moreConcerti];
    } else {
        mappedResponse.concerto.push(moreConcerti);
    }
    const items: MusicListItem[] = compact([
        ...musicListIfExists(mappedResponse, 'solo'),
        ...musicListIfExists(mappedResponse, 'concerto'),
        ...musicListIfExists(mappedResponse, 'chamber'),
        ...musicListIfExists(mappedResponse, 'composition', true),
        ...musicListIfExists(mappedResponse, 'videogame', true),
    ]);

    return items;
};

// For typing purposes, does not work when created within the object.
const queryItemsAtom: WritableAtom<
    QueryObserverResult<MusicListItem[], Error>,
    [],
    void
> = atomWithQuery<MusicListItem[]>(() => ({
    queryKey: ['musicPlaylist'],
    queryFn: fetchPlaylistFn,
}));

export const musicStore = atomWithImmer(initialState);
const { toWriteAtom, toToggleAtom } = partialAtomGetter(musicStore);

export const musicAtoms = {
    ...toAtoms(musicStore),
    items: queryItemsAtom,
    flatItems: atom(
        (get) => get(musicStore).flatItems,
        (get, _set) => {
            const flatItems: MusicFileItem[] = [];
            for (const musicListItem of get(musicStore).items) {
                if (isMusicItem(musicListItem)) {
                    flatItems.push(...musicListItem.musicFiles);
                }
            }

            return flatItems.map((item, idx) => ({ ...item, idx }));
        },
    ),
    isShuffle: atom(
        (get) => get(musicStore).isShuffle,
        (_get, set) => {
            set(musicStore, (draft) => {
                draft.isShuffle = !draft.isShuffle;
                draft.flatItems = draft.isShuffle
                    ? shuffle(draft.flatItems)
                    : sortBy(draft.flatItems, ['idx']);
            });
        },
    ),
    isPlaying: toToggleAtom('isPlaying'),
    isLoading: toToggleAtom('isLoading'),
    isMouseMove: toToggleAtom('isMouseMove'),
    volume: toWriteAtom('volume'),
    currentTrack: toWriteAtom('currentTrack'),
    playbackPosition: toWriteAtom('playbackPosition'),
    radii: toWriteAtom('radii'),
    angle: toWriteAtom('angle'),
    isHoverSeekring: toWriteAtom('isHoverSeekring'),
};

const getFirstTrackAtom = atom((get) => ({
    fn: (args: { composer?: string; piece?: string; movement?: string }) => {
        const { composer, piece, movement = '' } = args;
        const flatItems = get(musicStore).flatItems;

        if (composer && piece) {
            return (
                flatItems.find((item) => {
                    // early return before looking through props.items
                    // if composer or piece don't match, return false
                    if (
                        (item.composer &&
                            composer !== getLastName(item.composer)) ||
                        (item.piece && piece !== normalizeString(item.piece))
                    ) {
                        return false;
                    }

                    // If we're here, that means composer and piece matched
                    // If movement also matches, we're golden.
                    if (item.name && movement === normalizeString(item.name)) {
                        return true;
                    }

                    // If not, then the only last possible way this returns true
                    // is if both movement and item.name are falsey, since that would mean there isn't
                    // a movement name associated with this track.
                    // if (!movement && !item.name) {
                    return true;
                    // }
                }) ?? flatItems[0]
            );
        }
        return flatItems[0];
    },
}));

const getNextTrackAtom = atom((get) => ({
    fn: (
        currentTrack: MusicFileItem | undefined,
        which: 'next' | 'prev',
        force = false,
    ) => {
        const flat = get(musicStore).flatItems;
        const trackNo = flat.findIndex((item) => item.id === currentTrack?.id);
        const nextTrackNo = which === 'next' ? trackNo + 1 : trackNo - 1;
        if (force) {
            return flat[modulo(nextTrackNo, flat.length)];
        }
        if (nextTrackNo >= 0 && nextTrackNo < flat.length) {
            return flat[nextTrackNo];
        }
    },
}));

const callbackAction = atom(
    null,
    (
        _get,
        set,
        {
            playing,
            playbackPosition,
            duration,
        }: {
            playing?: boolean;
            playbackPosition: number;
            duration: number;
        },
    ) => {
        set(musicStore, (draft) => {
            draft.isPlaying = playing ?? draft.isPlaying;
            draft.playbackPosition = playbackPosition;
            draft.duration = duration;
        });
    },
);

export const musicActions = {
    callbackAction,
    getFirstTrackAtom,
    getNextTrackAtom,
};

// export const musicStore = createStore('musicPlayer')(
//     initialState,
//     zustandMiddlewareOptions,
// )
//     .extendSelectors((_set, get, _api) => ({
//         getFirstTrack: (args: {
//             composer?: string;
//             piece?: string;
//             movement?: string;
//         }) => {
//             const { composer, piece, movement = '' } = args;
//             const flatItems = get.flatItems();

//             if (composer && piece) {
//                 return (
//                     flatItems.find((item) => {
//                         // early return before looking through props.items
//                         // if composer or piece don't match, return false
//                         if (
//                             (item.composer &&
//                                 composer !== getLastName(item.composer)) ||
//                             (item.piece &&
//                                 piece !== normalizeString(item.piece))
//                         ) {
//                             return false;
//                         }

//                         // If we're here, that means composer and piece matched
//                         // If movement also matches, we're golden.
//                         if (
//                             item.name &&
//                             movement === normalizeString(item.name)
//                         ) {
//                             return true;
//                         }

//                         // If not, then the only last possible way this returns true
//                         // is if both movement and item.name are falsey, since that would mean there isn't
//                         // a movement name associated with this track.
//                         if (!movement && !item.name) {
//                             return true;
//                         }
//                     }) ?? flatItems[0]
//                 );
//             }
//             return flatItems[0];
//         },
//         getNextTrack: (
//             currentTrack: MusicFileItem | undefined,
//             which: 'next' | 'prev',
//             force = false,
//         ) => {
//             const flat = get.flatItems();
//             const trackNo = flat.findIndex(
//                 (item) => item.id === currentTrack?.id,
//             );
//             const nextTrackNo = which === 'next' ? trackNo + 1 : trackNo - 1;
//             if (force) {
//                 return flat[modulo(nextTrackNo, flat.length)];
//             }
//             if (nextTrackNo >= 0 && nextTrackNo < flat.length) {
//                 return flat[nextTrackNo];
//             }
//         },
//     }))
//     .extendActions((set, _get, _api) => ({
//         callbackAction: ({
//             playing,
//             playbackPosition,
//             duration,
//         }: {
//             playing?: boolean;
//             playbackPosition: number;
//             duration: number;
//         }) => {
//             set.state((state) => {
//                 state.isPlaying = playing ?? state.isPlaying;
//                 state.playbackPosition = playbackPosition;
//                 state.duration = duration;
//             });
//         },
//         toggleShuffle: () => {
//             set.state((state) => {
//                 state.isShuffle = !state.isShuffle;
//                 state.flatItems = state.isShuffle
//                     ? shuffle(state.flatItems)
//                     : sortBy(state.flatItems, ['idx']);
//             });
//         },
//         togglePlaying: () => {
//             set.state((state) => {
//                 state.isPlaying = !state.isPlaying;
//             });
//         },
//     }));
