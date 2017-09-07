import { transformGCalEventsToListItems } from '@/js/components/Schedule/utils.js';
import { googleAPI } from '@/js/services/GoogleAPI.js';
import moment from 'moment-timezone';

export const SCHEDULE = {
    FETCH_EVENTS_SUCCESS: 'SCHEDULE--FETCH_EVENTS_SUCCESS',
    FETCH_EVENTS_REQUEST: 'SCHEDULE--FETCH_EVENTS_REQUEST',
    FETCH_LAT_LNG_REQUEST: 'SCHEDULE--FETCH_LAT_LNG_REQUEST',
    FETCH_LAT_LNG_SUCCESS: 'SCHEDULE--FETCH_LAT_LNG_SUCCESS',
    SELECT_EVENT: 'SCHEDULE--SELECT_EVENT',
    ANIMATE_SCROLL_START: 'SCHEDULE--ANIMATE_SCROLL_START',
    ANIMATE_SCROLL_STOP: 'SCHEDULE--ANIMATE_SCROLL_STOP'
};

const fetchEventsRequest = () => ({
    type: SCHEDULE.FETCH_EVENTS_REQUEST
});

const fetchEventsSuccess = (listItems, currentItem) => ({
    type: SCHEDULE.FETCH_EVENTS_SUCCESS,
    listItems: listItems,
    // Initially default to the closest upcoming event.
    currentItem: currentItem
});

const shouldFetchEvents = (state) => {
    const eventItemsReducer = state.schedule_eventItems;
    // should not call api if have items or isFetching
    // will update if we need to add functionality to get more events
    return (eventItemsReducer.items.length === 0 && !eventItemsReducer.isFetching);
}

const _fetchEvents = (initialEventDateString) => (
    dispatch => {
        dispatch(fetchEventsRequest());
        return googleAPI.getCalendarEvents().then(response => {
            const listItems = transformGCalEventsToListItems(response.data.items);
            const currentItem = listItems.find(
                item => item.type !== 'month'
                && moment(initialEventDateString).isSame(item.dateTime, 'day')
            ) || listItems.find(item => item.type !== 'month');
            return dispatch(fetchEventsSuccess(listItems, currentItem));
        });
    }
);

export const fetchEvents = (initialEventDateString) => (
    (dispatch, getState) => {
        if (shouldFetchEvents(getState())) {
            // need to fetch items
            return dispatch(_fetchEvents(initialEventDateString));
        } else {
            // already have items
            return Promise.resolve();
        }
    }
);

const fetchLatLngRequest = () => ({
    type: SCHEDULE.FETCH_LAT_LNG_REQUEST
});

const fetchLatLngSuccess = (match) => ({
    type: SCHEDULE.FETCH_LAT_LNG_SUCCESS,
    ...match.geometry.location
})

const shouldFetchLatLng = (state) => {
    const eventItemsReducer = state.schedule_eventItems;
    return (!eventItemsReducer.isFetchingLatLng);
}

const _fetchLatLng = (location) => (
    dispatch => {
        dispatch(fetchLatLngRequest());
        return googleAPI.geocode(location).then(response => {
            const firstMatch = response.data.results[0];
            return dispatch(fetchLatLngSuccess(firstMatch));
        });
    }
);

export const fetchLatLng = (location) => (
    (dispatch, getState) => {
        if (shouldFetchLatLng(getState())) {
            return dispatch(_fetchLatLng(location));
        } else {
            return Promise.resolve();
        }
    }
);

export const selectEvent = (eventItem) => (
    dispatch => (
        dispatch({
            type: SCHEDULE.SELECT_EVENT,
            eventItem: eventItem
        })
    )
);