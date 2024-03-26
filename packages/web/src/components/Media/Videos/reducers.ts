import { createAction, createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { UnknownAction } from 'redux';
import type { ThunkAction } from 'redux-thunk';
import youTube from 'src/services/YouTube';

import type {
    VideoItemShape,
    VideoPlayerStateShape,
    VideoPlaylistStateShape,
} from 'src/components/Media/Videos/types';
import type { GlobalStateShape } from 'src/store';
import type { ThunkAPIType } from 'src/types';

const videoPlayerInitialState: VideoPlayerStateShape = {
    isPlayerReady: false,
    videoId: '',
    isPreviewOverlay: false,
    isPlaying: false,
};

export const playerIsReady = createAction<undefined>('videoPlayer/isReady');
const playVideoAction = createAction<string>('videoPlayer/playVideo');
export const resetPlayer = createAction<undefined>('videoPlayer/reset');

const videoPlayerSlice = createSlice({
    name: 'videoPlayer',
    initialState: videoPlayerInitialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchVideoPlaylist.fulfilled, (state, action) => {
                state.videoId = action.payload[0].id;
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
            .addDefaultCase((state) => state);
    },
});

export const videoPlayerReducer = videoPlayerSlice.reducer;

export const togglePlaylist = createAction<boolean | undefined>(
    'videoPlaylist/togglePlaylist',
);

export const fetchVideoPlaylist = createAsyncThunk<
    VideoItemShape[],
    undefined,
    ThunkAPIType
>(
    'videoPlayer/fetchPlaylist',
    async () => {
        const playlistResponse = await youTube.getPlaylistItems();
        const videoItems: (Youtube.PlaylistItem & Youtube.Video)[] =
            playlistResponse.data.items.filter((item: Youtube.PlaylistItem) => {
                return (
                    item?.snippet?.thumbnails &&
                    Object.keys(item.snippet.thumbnails).length !== 0
                );
            });
        const videoIds = videoItems.reduce(
            (prev: string[], item: Youtube.PlaylistItem) => {
                if (item?.snippet?.resourceId?.videoId !== undefined) {
                    prev.push(item.snippet.resourceId.videoId);
                    return prev;
                }
                return prev;
            },
            [],
        );
        const videosResponse = await youTube.getVideos(videoIds);
        for (const item of videosResponse.data.items) {
            const idx = videoItems.findIndex(
                (vi) => vi.snippet?.resourceId?.videoId === item.id,
            );
            if (idx >= 0) {
                videoItems[idx] = { ...videoItems[idx], ...item };
            }
        }
        return videoItems;
    },
    {
        condition: (_, { getState }) => {
            return (
                !getState().videoPlaylist.isFetching &&
                !getState().videoPlaylist.items.length
            );
        },
    },
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
                const isShow =
                    action.payload === undefined
                        ? !state.isShow
                        : action.payload;
                state.isShow = isShow;
            })
            .addDefaultCase((state) => state);
    },
});

export const videoPlaylistReducer = videoPlaylistSlice.reducer;

export const playVideo =
    (
        isMobile = false,
        videoId?: string,
    ): ThunkAction<void, GlobalStateShape, void, UnknownAction> =>
    (dispatch, getState) => {
        const videoPlayerReducer = getState().videoPlayer;
        if (
            videoId !== undefined &&
            !getState().videoPlaylist.items.find(
                (item: VideoItemShape) => item.id === videoId,
            )
        ) {
            return;
        }
        if (!isMobile) {
            setTimeout(() => dispatch(togglePlaylist(false)), 500);
        }
        if (
            videoPlayerReducer.isPlaying &&
            videoId === videoPlayerReducer.videoId
        ) {
            return;
        }
        const vid = videoId ? videoId : videoPlayerReducer.videoId;
        youTube.loadVideoById(vid, true);
        dispatch(playVideoAction(vid));
    };
