import { PRESS_ACTIONS } from 'js/components/Press/actions.js';

export const acclaimsListReducer = (state = {
    isFetching: false,
    items: [],
}, action) => {
    switch (action.type) {
        case PRESS_ACTIONS.FETCH_ACCLAIMS_SUCCESS:
            return { isFetching: false, items: action.items };
        case PRESS_ACTIONS.FETCH_ACCLAIMS_ERROR:
            return { ...state, isFetching: false }
        case PRESS_ACTIONS.FETCH_ACCLAIMS_REQUEST:
            return state.isFetching ? state : { ...state, isFetching: true };
        default:
            return state;
    };
};
