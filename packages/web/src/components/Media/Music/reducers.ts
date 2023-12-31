import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { compact, shuffle, sortBy } from 'lodash-es';

import {
    MusicCategories,
    MusicFileItem,
    MusicItem,
    MusicListItem,
    MusicResponse,
    MusicStateShape,
    isMusicItem,
} from 'src/components/Media/Music/types';
import { ThunkAPIType } from 'src/types';
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
    angle: 0,
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
}

interface FetchPlaylistThunkArgs {
    composer?: string;
    piece?: string;
    movement?: string;
}

export const fetchPlaylistThunk = createAsyncThunk<
    FetchPlaylistThunkReturn,
    FetchPlaylistThunkArgs,
    ThunkAPIType
>(
    'music/fetchPlaylist',
    async ({ composer, piece, movement }) => {
        try {
            const { data: response } =
                await axios.get<MusicResponse>('/api/music');
            const mappedResponse: MusicResponse = {};
            for (const category in response) {
                mappedResponse[category] = response[category].map(
                    (musicItem) => {
                        const mappedFiles = musicItem.musicFiles.map(
                            (musicFile) => {
                                const mappedFile = {
                                    ...musicFile,
                                    piece: musicItem.piece,
                                    composer: musicItem.composer,
                                    contributors: musicItem.contributors,
                                    year: musicItem.year,
                                };
                                // flatItems.push(mappedFile);
                                return mappedFile;
                            },
                        );
                        return {
                            ...musicItem,
                            musicFiles: mappedFiles,
                        };
                    },
                );
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

            let flatItems: MusicFileItem[] = [];
            for (const musicListItem of items) {
                if (isMusicItem(musicListItem)) {
                    flatItems.push(...musicListItem.musicFiles);
                }
            }

            flatItems = flatItems.map((item, idx) => ({ ...item, idx }));

            const firstTrack = getFirstTrack(
                flatItems,
                composer,
                piece,
                movement,
            );
            return {
                items,
                flatItems,
                firstTrack,
            };
        } catch (e) {
            console.log(e);
            throw e;
        }
    },
    {
        condition: (_, { getState }) => {
            return (
                !getState().musicPlayer.isFetching &&
                getState().musicPlayer.items.length === 0
            );
        },
    },
);

export const getFirstTrack = (
    flatItems: MusicFileItem[],
    composer: string | undefined,
    piece: string | undefined,
    movement = '',
) => {
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
                if (!movement && !item.name) {
                    return true;
                }
            }) ?? flatItems[0]
        );
    }
    return flatItems[0];
};

export const getNextTrack = (
    flat: MusicFileItem[],
    currentTrack: MusicFileItem | undefined,
    which: 'next' | 'prev',
    force = false,
) => {
    const trackNo = flat.findIndex((item) => item.id === currentTrack?.id);
    const nextTrackNo = which === 'next' ? trackNo + 1 : trackNo - 1;
    if (force) {
        return flat[modulo(nextTrackNo, flat.length)];
    }
    if (nextTrackNo >= 0 && nextTrackNo < flat.length) {
        return flat[nextTrackNo];
    }
};

export const toggleShuffleAction = createAction<undefined>(
    'music/toggleShuffle',
);
export const isLoadingAction = createAction<boolean>('music/isLoading');
export const setTrackAction = createAction<MusicFileItem>('music/setTrack');
export const updateAction = createAction<{
    playing?: boolean;
    playbackPosition?: number;
    duration?: number;
}>('music/updatePlaying');
export const isMouseMoveAction = createAction<boolean>('music/mouseMove');
export const hoverSeekringAction = createAction<{
    isHoverSeekring: boolean;
    angle?: number;
}>('music/hoverSeekring');
export const setRadiiAction = createAction<{
    inner: number;
    outer: number;
    base: number;
}>('music/radii');
export const volumeAction = createAction<number>('music/volume');

const musicPlayerSlice = createSlice({
    name: 'audioPlaylist',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPlaylistThunk.pending, (state, _) => {
                state.isFetching = true;
            })
            .addCase(fetchPlaylistThunk.rejected, (state, _) => {
                state.isFetching = false;
            })
            .addCase(fetchPlaylistThunk.fulfilled, (state, action) => {
                state.isFetching = false;
                state.items = action.payload.items;
                state.flatItems = action.payload.flatItems;
                state.currentTrack = action.payload.firstTrack;
            })
            .addCase(toggleShuffleAction, (state, _) => {
                state.isShuffle = !state.isShuffle;
                state.flatItems = state.isShuffle
                    ? shuffle(state.flatItems)
                    : sortBy(state.flatItems, ['idx']);
            })
            .addCase(isLoadingAction, (state, action) => {
                state.isLoading = action.payload;
            })
            .addCase(setTrackAction, (state, action) => {
                state.currentTrack = action.payload;
            })
            .addCase(updateAction, (state, action) => {
                state.isPlaying = action.payload.playing ?? state.isPlaying;
                state.playbackPosition =
                    action.payload.playbackPosition ?? state.playbackPosition;
                state.duration = action.payload.duration ?? state.duration;
            })
            .addCase(isMouseMoveAction, (state, action) => {
                state.isMouseMove = action.payload;
            })
            .addCase(hoverSeekringAction, (state, action) => {
                state.isHoverSeekring = action.payload.isHoverSeekring;
                state.angle = action.payload.angle ?? state.angle;
            })
            .addCase(setRadiiAction, (state, action) => {
                state.radii = action.payload;
            })
            .addCase(volumeAction, (state, action) => {
                state.volume = action.payload;
            })
            .addDefaultCase((state) => state);
    },
});

export const musicPlayerReducer = musicPlayerSlice.reducer;
