import axios from 'axios';
import { ThunkAction } from 'redux-thunk';

import DISCS_ACTIONS from 'src/components/About/Discs/actionTypeKeys';
import * as ActionTypes from 'src/components/About/Discs/actionTypes';
import { Disc } from 'src/components/About/Discs/types';
import { GlobalStateShape } from 'src/types';

const fetchDiscsRequest = (): ActionTypes.FetchDiscsRequest => ({
    type: DISCS_ACTIONS.FETCH_DISCS_REQUEST,
});

const fetchDiscsSuccess = (discs: Disc[]): ActionTypes.FetchDiscsSuccess => ({
    type: DISCS_ACTIONS.FETCH_DISCS_SUCCESS,
    discs,
});

const fetchDiscsError = (): ActionTypes.FetchDiscsError => ({
    type: DISCS_ACTIONS.FETCH_DISCS_ERROR,
});

const shouldFetchDiscs = (state: GlobalStateShape) => {
    return !state.discs.isFetching && state.discs.discs.length === 0;
};

type FetchDiscsActions = ActionTypes.FetchDiscsError | ActionTypes.FetchDiscsRequest | ActionTypes.FetchDiscsSuccess;

const fetchDiscs = (): ThunkAction<Promise<void>, GlobalStateShape, void, FetchDiscsActions> =>
    async (dispatch) => {
        try {
            dispatch(fetchDiscsRequest());
            const { data: discs }: { data: Disc[] } = await axios.get('/api/discs');
            // sort by date descending
            dispatch(fetchDiscsSuccess(discs.sort((a, b) => b.releaseDate - a.releaseDate)));
        } catch (err) {
            console.log('fetch disc error', err);
            dispatch(fetchDiscsError());
        }
    };

export const fetchDiscsAction = (): ThunkAction<Promise<void>, GlobalStateShape, void, FetchDiscsActions> =>
    async (dispatch, getState) => {
        if (shouldFetchDiscs(getState())) {
            await dispatch(fetchDiscs());
        }
    };
