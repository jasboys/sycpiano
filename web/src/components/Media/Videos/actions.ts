import { ThunkAction } from 'redux-thunk';

import VIDEO_ACTIONS from 'src/components/Media/Videos/actionTypeKeys';
import * as ActionTypes from 'src/components/Media/Videos/actionTypes';
import youTube from 'src/services/YouTube';

import { VideoItemShape } from 'src/components/Media/Videos/types';
import { GlobalStateShape } from 'src/types';

export const initializeYoutubeElement = (el: HTMLElement, videoId?: string, isMobile?: boolean): ThunkAction<void, GlobalStateShape, void, ActionTypes.PlayerIsReady> => (dispatch) => {
    youTube.initializePlayerOnElement(el);
    youTube.executeWhenPlayerReady(() => {
        dispatch({
            type: VIDEO_ACTIONS.PLAYER_IS_READY,
        });
        videoId && dispatch(playVideo(isMobile, videoId));
    });
};

const fetchPlaylistRequest = (): ActionTypes.FetchPlaylistRequest => ({
    type: VIDEO_ACTIONS.FETCH_PLAYLIST_REQUEST,
});

const fetchPlaylistSuccess = (videos: VideoItemShape[]): ActionTypes.FetchPlaylistSuccess => ({
    type: VIDEO_ACTIONS.FETCH_PLAYLIST_SUCCESS,
    videos,
    videoId: videos[0].id,
});

const fetchPlaylistError = (): ActionTypes.FetchPlaylistError => ({
    type: VIDEO_ACTIONS.FETCH_PLAYLIST_ERROR,
});

type FetchPlaylistActions = ActionTypes.FetchPlaylistError | ActionTypes.FetchPlaylistRequest | ActionTypes.FetchPlaylistSuccess;

// need two separate api requests, because statistics is only available when fetching videos
const fetchPlaylist = (): ThunkAction<void, GlobalStateShape, void, FetchPlaylistActions> => async (dispatch) => {
    try {
        dispatch(fetchPlaylistRequest());
        const playlistResponse = await youTube.getPlaylistItems();
        const videoItems = playlistResponse.data.items;
        const videoIds = videoItems.map((item: Youtube.PlaylistItem) => {
            return item.snippet.resourceId.videoId;
        });
        const videosResponse = await youTube.getVideos(videoIds);
        await videosResponse.data.items.forEach((item: Youtube.Video, i: number) => {
            videoItems[i] = { ...videoItems[i], ...item };
        });
        dispatch(fetchPlaylistSuccess(videoItems));
    } catch (err) {
        dispatch(fetchPlaylistError());
        console.log('fetch videos error', err);
    }
};

const shouldFetchPlaylist = (state: GlobalStateShape) => {
    const playlistReducer = state.video_playlist;
    return (playlistReducer.items.length === 0 && !playlistReducer.isFetching);
};

export const createFetchPlaylistAction = (): ThunkAction<void, GlobalStateShape, void, FetchPlaylistActions | ActionTypes.TogglePlaylist> => (dispatch, getState) => {
    if (shouldFetchPlaylist(getState())) {
        dispatch(fetchPlaylist());
    } else {
        dispatch(togglePlaylist(true, getState()));
    }
};

const playItem = (videoId: string = null): ActionTypes.PlayItem => ({
    type: VIDEO_ACTIONS.PLAY_ITEM,
    videoId,
});

const togglePlaylist = (show: boolean, state: GlobalStateShape): ActionTypes.TogglePlaylist => {
    const isShow = (show === null) ? !state.video_playlist.isShow : show;
    return {
        type: VIDEO_ACTIONS.TOGGLE_PLAYLIST,
        isShow,
    };
};

export const togglePlaylistAction = (show: boolean = null): ThunkAction<void, GlobalStateShape, void, ActionTypes.TogglePlaylist> => (dispatch, getState) => (
    dispatch(togglePlaylist(show, getState()))
);

export const playVideo = (isMobile: boolean = false, videoId?: string): ThunkAction<void, GlobalStateShape, void, ActionTypes.TogglePlaylist | ActionTypes.PlayItem> => (dispatch, getState) => {
    const videoPlayerReducer = getState().video_player;
    if (!getState().video_playlist.items.find((item) => item.id === videoId)) {
        return;
    }
    if (!isMobile) {
        setTimeout(() => dispatch(togglePlaylist(false, getState())), 500);
    }
    if (videoPlayerReducer.isPlaying && videoId === videoPlayerReducer.videoId) {
        return;
    }
    const vid = videoId ? videoId : videoPlayerReducer.videoId;
    youTube.loadVideoById(vid, true);
    dispatch(playItem(vid));
};

export const resetPlayer = (): ThunkAction<void, GlobalStateShape, void, ActionTypes.ResetPlayer> => (dispatch) => {
    youTube.destroyPlayer();
    dispatch({
        type: VIDEO_ACTIONS.RESET_PLAYER,
    });
};
