import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';
import { compact } from 'lodash-es';

import {
    AudioPlaylistStateShape,
    MusicCategories,
    MusicFileItem,
    MusicItem,
    MusicListItem,
    MusicResponse,
} from 'src/components/Media/Music/types';
import { ThunkAPIType } from 'src/types';

const initialState: AudioPlaylistStateShape = {
    isFetching: false,
    items: [],
    flatItems: [],
};

const musicListIfExists = (
    response: MusicResponse,
    category: MusicCategories,
) => {
    const curr = response[category];
    if (curr !== undefined && curr.length !== 0) {
        return [{ type: category, id: category }, ...curr];
    } else {
        return [];
    }
};

interface ThunkReturn {
    items: MusicListItem[];
    flatItems: MusicFileItem[];
}

export const fetchPlaylist = createAsyncThunk<ThunkReturn, void, ThunkAPIType>(
    'audioPlaylist/fetchPlaylist',
    async () => {
        try {
            const { data: response } = await axios.get<
                void,
                { data: MusicResponse }
            >('/api/music');
            const flatItems: MusicFileItem[] = [];
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
                                flatItems.push(mappedFile);
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
                ...musicListIfExists(mappedResponse, 'composition'),
                ...musicListIfExists(mappedResponse, 'videogame'),
            ]);
            // dispatch(fetchPlaylistSuccess(items, flatItems));
            return { items, flatItems };
        } catch (e) {
            console.log(e);
            return { items: [], flatItems: [] };
        }
    },
    {
        condition: (_, { getState }) => {
            return (
                !getState().audioPlaylist.isFetching &&
                getState().audioPlaylist.items.length === 0
            );
        },
    },
);

const audioPlaylistSlice = createSlice({
    name: 'audioPlaylist',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchPlaylist.pending, (state, _) => {
                state.isFetching = true;
            })
            .addCase(fetchPlaylist.rejected, (state, _) => {
                state.isFetching = false;
            })
            .addCase(fetchPlaylist.fulfilled, (state, action) => {
                state.isFetching = false;
                state.items = action.payload.items;
                state.flatItems = action.payload.flatItems;
            })
            .addDefaultCase((state) => state);
    },
});

export const audioPlaylistReducer = audioPlaylistSlice.reducer;

