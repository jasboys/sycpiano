import { ThunkAction } from 'redux-thunk';

import VIDEO_ACTIONS from 'src/components/Media/Videos/actionTypeKeys';
import * as ActionTypes from 'src/components/Media/Videos/actionTypes';
import youTube from 'src/services/YouTube';

import { VideoItemShape } from 'src/components/Media/Videos/types';
import { GlobalStateShape } from 'src/types';


const fetchPlaylistRequest = (): ActionTypes.FetchPlaylistRequest => ({
    type: VIDEO_ACTIONS.FETCH_PLAYLIST_REQUEST,
});

const fetchPlaylistSuccess = (videos: VideoItemShape[], videoId: string): ActionTypes.FetchPlaylistSuccess => ({
    type: VIDEO_ACTIONS.FETCH_PLAYLIST_SUCCESS,
    videos,
    videoId,
});

const fetchPlaylistError = (): ActionTypes.FetchPlaylistError => ({
    type: VIDEO_ACTIONS.FETCH_PLAYLIST_ERROR,
});

type FetchPlaylistActions = ActionTypes.FetchPlaylistError | ActionTypes.FetchPlaylistRequest | ActionTypes.FetchPlaylistSuccess;

const togglePlaylist = (show: boolean, state: GlobalStateShape): ActionTypes.TogglePlaylist => {
    const isShow = (show === null) ? !state.videoPlaylist.isShow : show;
    return {
        type: VIDEO_ACTIONS.TOGGLE_PLAYLIST,
        isShow,
    };
};

const playItem = (videoId: string = null): ActionTypes.PlayItem => ({
    type: VIDEO_ACTIONS.PLAY_ITEM,
    videoId,
});

export const playVideo = (isMobile = false, videoId?: string): ThunkAction<void, GlobalStateShape, void, ActionTypes.TogglePlaylist | ActionTypes.PlayItem> => (dispatch, getState) => {
    const videoPlayerReducer = getState().videoPlayer;
    if (!getState().videoPlaylist.items.find((item) => item.id === videoId)) {
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

const shouldFetchPlaylist = (state: GlobalStateShape) => {
    const playlistReducer = state.videoPlaylist;
    return (playlistReducer.items.length === 0 && !playlistReducer.isFetching);
};
// need two separate api requests, because statistics is only available when fetching videos
const fetchPlaylist = (isMobile: boolean, videoId?: string): ThunkAction<Promise<void>, GlobalStateShape, void, FetchPlaylistActions> => async (dispatch, getState) => {
    try {
        dispatch(fetchPlaylistRequest());
        const playlistResponse = await youTube.getPlaylistItems();
        const videoItems = playlistResponse.data.items.filter((item: Youtube.PlaylistItem) => {
            return Object.keys(item.snippet.thumbnails).length != 0;
        });
        const videoIds = videoItems.map((item: Youtube.PlaylistItem) => {
            return item.snippet.resourceId.videoId;
        });
        const videosResponse = await youTube.getVideos(videoIds);
        await videosResponse.data.items.forEach((item: Youtube.Video, i: number) => {
            videoItems[i] = { ...videoItems[i], ...item };
        });
        const id = videoId || videoItems[0].id;
        dispatch(fetchPlaylistSuccess(videoItems, id));
        getState().videoPlayer.isPlayerReady && videoId && dispatch(playVideo(isMobile, videoId));
    } catch (err) {
        dispatch(fetchPlaylistError());
        console.log('fetch videos error', err);
    }
};

export const createFetchPlaylistAction = (isMobile: boolean, videoId?: string): ThunkAction<void, GlobalStateShape, void, FetchPlaylistActions | ActionTypes.TogglePlaylist> => (dispatch, getState) => {
    if (shouldFetchPlaylist(getState())) {
        dispatch(fetchPlaylist(isMobile, videoId));
    } else {
        dispatch(togglePlaylist(true, getState()));
    }
};

export const togglePlaylistAction = (show: boolean = null): ThunkAction<void, GlobalStateShape, void, ActionTypes.TogglePlaylist> => (dispatch, getState) => (
    dispatch(togglePlaylist(show, getState()))
);

export const resetPlayer = (): ThunkAction<void, GlobalStateShape, void, ActionTypes.ResetPlayer> => (dispatch) => {
    youTube.destroyPlayer();
    dispatch({
        type: VIDEO_ACTIONS.RESET_PLAYER,
    });
};

export const initializeYoutubeElement = (el: HTMLElement, videoId?: string, isMobile?: boolean): ThunkAction<void, GlobalStateShape, void, ActionTypes.PlayerIsReady> => (dispatch, getState) => {
    youTube.initializePlayerOnElement(el);
    youTube.executeWhenPlayerReady(() => {
        dispatch({
            type: VIDEO_ACTIONS.PLAYER_IS_READY,
        });
        getState().videoPlaylist.items.length && videoId && dispatch(playVideo(isMobile, videoId));
    });
};