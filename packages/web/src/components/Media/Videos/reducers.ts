import { AnyAction } from 'redux';
import youTube from 'src/services/YouTube';

import { VideoItemShape, VideoPlayerStateShape, VideoPlaylistStateShape } from 'src/components/Media/Videos/types';

import { createSlice, createAsyncThunk, createAction } from '@reduxjs/toolkit';
import { ThunkAPIType } from 'src/types';
import { ThunkAction } from 'redux-thunk';
import { GlobalStateShape } from 'src/store';

const videoPlayerInitialState: VideoPlayerStateShape = {
    isPlayerReady: false,
    videoId: '',
    isPreviewOverlay: false,
    isPlaying: false,
};

export const playerIsReady = createAction<void>('videoPlayer/isReady');
const playVideoAction = createAction<string>('videoPlayer/playVideo');
export const resetPlayer = createAction<void>('videoPlayer/reset');

const videoPlayerSlice = createSlice({
    name: 'videoPlayer',
    initialState: videoPlayerInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchVideoPlaylist.fulfilled, (state, action) => {
                state.videoId = action.payload[0].id!;
            })
            .addCase(playerIsReady, (state) => {
                state.isPlayerReady = true;
                state.isPreviewOverlay = true;
            })
            .addCase(playVideoAction, (state, action) => {
                state.videoId = action.payload;
                state.isPlayerReady = true;
                state.isPreviewOverlay = false;
            })
            .addCase(resetPlayer, (state) => {
                state.isPlayerReady = false;
                state.videoId = '';
                state.isPlaying = false;
                state.isPreviewOverlay = false;
            })
            .addDefaultCase(state => state);
    }
});

export const videoPlayerReducer = videoPlayerSlice.reducer;

// export const videoPlayerReducer: Reducer<VideoPlayerStateShape, ActionTypes> = (state = {
//     isPlayerReady: false,
//     videoId: '',
//     isPreviewOverlay: false,
//     isPlaying: false,
// }, action) => {
//     switch (action.type) {
//         case VIDEO_ACTIONS.PLAYER_IS_READY:
//             return {
//                 ...state,
//                 isPlayerReady: true,
//                 isPreviewOverlay: true,
//             };
//         case VIDEO_ACTIONS.PLAY_ITEM:
//             return {
//                 ...state,
//                 videoId: action.videoId,
//                 isPlaying: true,
//                 isPreviewOverlay: false,
//             };
//         case VIDEO_ACTIONS.FETCH_PLAYLIST_SUCCESS:
//             return {
//                 ...state,
//                 videoId: action.videoId,
//             };
//         case VIDEO_ACTIONS.RESET_PLAYER:
//             return {
//                 ...state,
//                 isPlayerReady: false,
//                 videoId: '',
//                 isPlaying: false,
//                 isPreviewOverlay: false,
//             };
//         default: return state;
//     }
// };
export const togglePlaylist = createAction<boolean | undefined>('videoPlaylist/togglePlaylist');

const videoIdExists = (id: string | undefined): id is string => id !== undefined;

export const fetchVideoPlaylist = createAsyncThunk<VideoItemShape[], void, ThunkAPIType>(
    'videoPlayer/fetchPlaylist',
    async () => {
        const playlistResponse = await youTube.getPlaylistItems();
        const videoItems: Partial<Youtube.PlaylistItem & Youtube.Video>[] =
            playlistResponse.data.items.filter((item: Youtube.PlaylistItem) => {
                return item?.snippet?.thumbnails && Object.keys(item.snippet.thumbnails).length != 0;
            });
        const videoIds = videoItems.map((item: Youtube.PlaylistItem) => {
            return item?.snippet?.resourceId && item.snippet.resourceId.videoId;
        });
        const videosResponse = await youTube.getVideos(videoIds.filter(videoIdExists));
        videosResponse.data.items.forEach((item: Youtube.Video, i: number) => {
            videoItems[i] = { ...videoItems[i], ...item };
        });
        return videoItems;
    },
    {
        condition: (_, { getState }) => {
            return !getState().videoPlaylist.isFetching && !getState().videoPlaylist.items.length;
        }
    }
);

const videoPlaylistInitialState: VideoPlaylistStateShape = {
    items: [],
    isFetching: false,
    isShow: true,
};

const videoPlaylistSlice = createSlice({
    name: 'videoPlaylist',
    initialState: videoPlaylistInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchVideoPlaylist.pending, (state) => {
                state.isFetching = true;
            })
            .addCase(fetchVideoPlaylist.rejected, (state) => {
                state.isFetching = false;
            })
            .addCase(fetchVideoPlaylist.fulfilled, (state, action) => {
                state.isFetching = false;
                state.isShow = true;
                state.items = action.payload;
            })
            .addCase(togglePlaylist, (state, action) => {
                const isShow = (action.payload === undefined) ? !state.isShow : action.payload;
                state.isShow = isShow;
            })
            .addDefaultCase(state => state);
    }
});

export const videoPlaylistReducer = videoPlaylistSlice.reducer;

// export const videoPlaylistReducer: Reducer<VideoPlaylistStateShape, ActionTypes> = (state = {
//     items: [],
//     isFetching: false,
//     isShow: true,
// }, action) => {
//     switch (action.type) {
//         case VIDEO_ACTIONS.FETCH_PLAYLIST_REQUEST:
//             return {
//                 ...state, isFetching: true,
//             };
//         case VIDEO_ACTIONS.FETCH_PLAYLIST_SUCCESS:
//             return {
//                 ...state,
//                 isFetching: false,
//                 items: action.videos,
//                 isShow: true,
//             };
//         case VIDEO_ACTIONS.FETCH_PLAYLIST_ERROR:
//             return {
//                 ...state,
//                 isFetching: false,
//             };
//         case VIDEO_ACTIONS.TOGGLE_PLAYLIST:
//             return {
//                 ...state,
//                 isShow: action.isShow,
//             };
//         default: return state;
//     }
// };

// export const initializeYoutubeElement = (el: HTMLElement, videoId?: string, isMobile?: boolean) => {
//     youTube.initializePlayerOnElement(el);
//     youTube.executeWhenPlayerReady(() => {
//         dispatch({
//             type: VIDEO_ACTIONS.PLAYER_IS_READY,
//         });
//         getState().videoPlaylist.items.length && videoId && dispatch(playVideo(isMobile, videoId));
//     });
// };

export const playVideo = (isMobile = false, videoId?: string): ThunkAction<void, GlobalStateShape, void, AnyAction> =>
    (dispatch, getState) => {
        const videoPlayerReducer = getState().videoPlayer;
        if (videoId !== undefined && !getState().videoPlaylist.items.find((item: VideoItemShape) => item.id === videoId)) {
            return;
        }
        if (!isMobile) {
            setTimeout(() => dispatch(togglePlaylist(false)), 500);
        }
        if (videoPlayerReducer.isPlaying && videoId === videoPlayerReducer.videoId) {
            return;
        }
        const vid = videoId ? videoId : videoPlayerReducer.videoId;
        youTube.loadVideoById(vid, true);
        dispatch(playVideoAction(vid));
    };