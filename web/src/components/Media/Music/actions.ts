import axios from 'axios';
import path from 'path';

import compact from 'lodash-es/compact';
import { ThunkAction } from 'redux-thunk';

import AUDIO_ACTIONS from 'src/components/Media/Music/actionTypeKeys';
import * as ActionTypes from 'src/components/Media/Music/actionTypes';
import { isMusicItem, MusicCategories, MusicFileItem, MusicItem, MusicListItem, MusicResponse } from 'src/components/Media/Music/types';
import { GlobalStateShape } from 'src/types';

export const storeRadii = (innerRadius: number, outerRadius: number, baseRadius: number): ThunkAction<void, GlobalStateShape, void> =>
    (dispatch) => dispatch({
        type: AUDIO_ACTIONS.STORE_RADII,
        innerRadius,
        outerRadius,
        baseRadius,
    } as ActionTypes.StoreRadii);

export const storeVerticalOffset = (offset: number): ThunkAction<void, GlobalEventHandlers, void> =>
    (dispatch) => dispatch({
        type: AUDIO_ACTIONS.STORE_VERTICAL_OFFSET,
        offset,
    } as ActionTypes.StoreVerticalOffset);

export const setHoverSeekring = (isHover: boolean, angle: number): ThunkAction<void, GlobalStateShape, void> =>
    (dispatch) => dispatch({
        type: AUDIO_ACTIONS.IS_HOVER_SEEKRING,
        isHoverSeekring: isHover,
        angle: angle ? angle : 0,
    } as ActionTypes.SetHoverSeekring);

export const setHoverPlaypause = (isHover: boolean): ThunkAction<void, GlobalStateShape, void> =>
    (dispatch) => dispatch({
        type: AUDIO_ACTIONS.IS_HOVER_PLAYPAUSE,
        isHoverPlaypause: isHover,
    } as ActionTypes.SetHoverPlaypause);

export const setMouseMove = (isMove: boolean): ThunkAction<void, GlobalStateShape, void> =>
    (dispatch) => dispatch({
        type: AUDIO_ACTIONS.IS_MOUSE_MOVE,
        isMouseMove: isMove,
    } as ActionTypes.SetMouseMove);

const fetchPlaylistRequest = (): ActionTypes.FetchPlaylistRequest => ({
    type: AUDIO_ACTIONS.FETCH_PLAYLIST_REQUEST,
});

const fetchPlaylistSuccess = (items: MusicListItem[]): ActionTypes.FetchPlaylistSuccess => ({
    type: AUDIO_ACTIONS.FETCH_PLAYLIST_SUCCESS,
    items,
});

const fetchPlaylistError = (): ActionTypes.FetchPlaylistError => ({
    type: AUDIO_ACTIONS.FETCH_PLAYLIST_ERROR,
});

const shouldFetchPlaylist = (state: GlobalStateShape) => {
    return !state.audio_playlist.isFetching && state.audio_playlist.items.length === 0;
};

const musicListIfExists = (response: MusicResponse, category: MusicCategories) => (
    response[category].length ? [
        { type: category, id: category },
        ...(response[category]),
    ] : []
);

const fetchPlaylist = (): ThunkAction<Promise<MusicListItem[]>, GlobalStateShape, void> => async (dispatch) => {
    try {
        dispatch(fetchPlaylistRequest());
        const { data: response }: { data: MusicResponse } = await axios.get('/api/music');
        const items: MusicListItem[] = compact([
            ...musicListIfExists(response, 'concerto'),
            ...musicListIfExists(response, 'solo'),
            ...musicListIfExists(response, 'chamber'),
            ...musicListIfExists(response, 'composition'),
        ]);
        dispatch(fetchPlaylistSuccess(items));
        return items;
    } catch (err) {
        console.log('fetch music error', err);
        dispatch(fetchPlaylistError());
    }
};

export const fetchPlaylistAction = (track: string): ThunkAction<Promise<MusicFileItem>, GlobalStateShape, void> =>
    async (dispatch, getState) => {
        let items;
        if (shouldFetchPlaylist(getState())) {
            items = await dispatch(fetchPlaylist());
        } else {
            items = getState().audio_playlist.items;
        }
        let firstTrack = (items.find((item) => isMusicItem(item)) as MusicItem).musicFiles[0];

        if (track) {
            firstTrack = items.reduce((prev, item) => {
                if (isMusicItem(item)) {
                    return prev.concat(item.musicFiles.filter((musicFile) => (
                        path.basename(musicFile.audioFile, '.mp3') === track
                    )));
                } else {
                    return prev;
                }
            }, [])[0];
        }
        return firstTrack;
    };
