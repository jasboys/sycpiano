import axios from 'axios';
import { compact, shuffle, sortBy } from 'lodash-es';

import {
    type MusicCategories,
    type MusicFileItem,
    type MusicItem,
    type MusicListItem,
    type MusicResponse,
    type MusicStateShape,
    isMusicItem,
} from 'src/components/Media/Music/types';
import { getLastName, modulo, normalizeString } from './utils.js';
import { createStore } from 'zustand-x';
import { zustandMiddlewareOptions } from 'src/utils.js';

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

export interface FetchPlaylistThunkReturn {
    items: MusicListItem[];
    flatItems: MusicFileItem[];
    firstTrack: MusicFileItem;
    prevTrack?: MusicFileItem;
    nextTrack?: MusicFileItem;
}

export const fetchPlaylistFn = async () => {
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

export const itemsToFlatItems = (items: MusicListItem[]): MusicFileItem[] => {
    const flatItems: MusicFileItem[] = [];
    for (const musicListItem of items) {
        if (isMusicItem(musicListItem)) {
            flatItems.push(...musicListItem.musicFiles);
        }
    }

    return flatItems.map((item, idx) => ({ ...item, idx }));
};

export const musicStore = createStore('musicPlayer')(
    initialState,
    zustandMiddlewareOptions,
)
    .extendSelectors((_set, get, _api) => ({
        getFirstTrack: (args: {
            composer?: string;
            piece?: string;
            movement?: string;
        }) => {
            const { composer, piece, movement = '' } = args;
            const flatItems = get.flatItems();

            if (composer && piece) {
                return (
                    flatItems.find((item) => {
                        // early return before looking through props.items
                        // if composer or piece don't match, return false
                        if (
                            (item.composer &&
                                composer !== getLastName(item.composer)) ||
                            (item.piece &&
                                piece !== normalizeString(item.piece))
                        ) {
                            return false;
                        }

                        // If we're here, that means composer and piece matched
                        // If movement also matches, we're golden.
                        if (
                            item.name &&
                            movement === normalizeString(item.name)
                        ) {
                            return true;
                        }

                        // If not, then the only last possible way this returns true
                        // is if both movement and item.name are falsey, since that would mean there isn't
                        // a movement name associated with this track.
                        if (!movement && !item.name) {
                            return true;
                        }
                    }) ?? flatItems[0]
                );
            }
            return flatItems[0];
        },
        getNextTrack: (
            currentTrack: MusicFileItem | undefined,
            which: 'next' | 'prev',
            force = false,
        ) => {
            const flat = get.flatItems();
            const trackNo = flat.findIndex(
                (item) => item.id === currentTrack?.id,
            );
            const nextTrackNo = which === 'next' ? trackNo + 1 : trackNo - 1;
            if (force) {
                return flat[modulo(nextTrackNo, flat.length)];
            }
            if (nextTrackNo >= 0 && nextTrackNo < flat.length) {
                return flat[nextTrackNo];
            }
        },
    }))
    .extendActions((set, _get, _api) => ({
        callbackAction: ({
            playing,
            playbackPosition,
            duration,
        }: {
            playing?: boolean;
            playbackPosition: number;
            duration: number;
        }) => {
            set.state((state) => {
                state.isPlaying = playing ?? state.isPlaying;
                state.playbackPosition = playbackPosition;
                state.duration = duration;
            });
        },
        toggleShuffle: () => {
            set.state((state) => {
                state.isShuffle = !state.isShuffle;
                state.flatItems = state.isShuffle
                    ? shuffle(state.flatItems)
                    : sortBy(state.flatItems, ['idx']);
            });
        },
        togglePlaying: () => {
            set.state((state) => {
                state.isPlaying = !state.isPlaying;
            });
        },
    }));
