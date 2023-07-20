import { AudioPlaylistStateShape, MusicCategories, MusicFileItem, MusicItem, MusicListItem, MusicResponse } from 'src/components/Media/Music/types';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ThunkAPIType } from 'src/types';
import axios from 'axios';
import { compact } from 'lodash-es';

const initialState: AudioPlaylistStateShape = {
    isFetching: false,
    items: [],
    flatItems: [],
};

const musicListIfExists = (response: MusicResponse, category: MusicCategories) => {
    const curr = response[category];
    if (curr !== undefined && curr.length !== 0) {
        return [
            { type: category, id: category },
            ...(curr),
        ];
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
            const { data: response } = await axios.get<void, { data: MusicResponse }>('/api/music');
            const flatItems: MusicFileItem[] = [];
            (Object.keys(response) as MusicCategories[]).forEach((category: MusicCategories) => {
                response[category]?.forEach((_music, idx) => {
                    response[category]![idx].musicFiles.forEach((_musicFile, idy) => {
                        response[category]![idx].musicFiles[idy] = {
                            ...response[category]![idx].musicFiles[idy],
                            piece: _music.piece,
                            composer: _music.composer,
                            contributors: _music.contributors,
                            year: _music.year,
                        };
                        flatItems.push(response[category]![idx].musicFiles[idy]);
                    });
                });
            });
            const moreConcerti: MusicItem = {
                composer: 'For more recordings of concerti, please contact Sean Chen directly',
                piece: '',
                id: 'more_concerti',
                musicFiles: [],
                type: 'concerto',
            };
            if (response.concerto === undefined) {
                response.concerto = [moreConcerti]
            } else {
                response.concerto.push(moreConcerti);
            }
            const items: MusicListItem[] = compact([
                ...musicListIfExists(response, 'solo'),
                ...musicListIfExists(response, 'concerto'),
                ...musicListIfExists(response, 'chamber'),
                ...musicListIfExists(response, 'composition'),
                ...musicListIfExists(response, 'videogame'),
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
            return !getState().audioPlaylist.isFetching && getState().audioPlaylist.items.length === 0;
        }
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
            .addDefaultCase(state => state);
    },
});

export const audioPlaylistReducer = audioPlaylistSlice.reducer;

// export const audioPlaylistReducer: Reducer<AudioPlaylistStateShape, ActionTypes> = (state: AudioPlaylistStateShape = {
//     isFetching: false,
//     items: [],
//     flatItems: [],
// }, action: ActionTypes) => {
//     switch (action.type) {
//         case AUDIO_ACTIONS.FETCH_PLAYLIST_REQUEST:
//             return {
//                 ...state,
//                 isFetching: true,
//             };
//         case AUDIO_ACTIONS.FETCH_PLAYLIST_ERROR:
//             return {
//                 ...state,
//                 isFetching: false,
//             };
//         case AUDIO_ACTIONS.FETCH_PLAYLIST_SUCCESS:
//             return {
//                 ...state,
//                 isFetching: false,
//                 items: action.items,
//                 flatItems: action.flatItems,
//             };
//         default: return state;
//     }
// };
