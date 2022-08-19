import {
    CachedEvent,
    DayItem,
    EventItemsStateShape,
    EventItemType,
    EventListName,
    FetchEventsAPIParams,
    FetchEventsArguments,
    itemIsDay,
    ScheduleStateShape,
    SearchEventsArguments,
} from 'src/components/Schedule/types';
import { createSlice, createAsyncThunk, createAction, isAnyOf } from '@reduxjs/toolkit';
import { ThunkAPIType } from 'src/types';
import axios from 'axios';

import { SortedArraySet } from 'collections/sorted-array-set';
import { transformCachedEventsToListItems } from './utils';
import { Optional } from 'sequelize/types';
import endOfMonth from 'date-fns/endOfMonth';
import parseISO from 'date-fns/parseISO';
import differenceInDays from 'date-fns/differenceInDays';
import min from 'date-fns/min';
import max from 'date-fns/max';

function equals(a: EventItemType, b: EventItemType) {
    // return a.dateTime.isSame(b.dateTime, 'minute');
    return (a.dateTime === b.dateTime);
}

function ascendCompare(a: EventItemType, b: EventItemType) {
    // if (a.dateTime.isSame(b.dateTime, 'minute')) { return 0; }
    // if (a.dateTime.isBefore(b.dateTime, 'minute')) { return -1; }
    // if (a.dateTime.isAfter(b.dateTime, 'minute')) { return 1; }
    return a.dateTime.localeCompare(b.dateTime);
}

function descendCompare(a: EventItemType, b: EventItemType) {
    // if (aTime.isSame(bTime, 'minute')) { return 0; }
    // if (aTime.isBefore(bTime, 'minute')) { return 1; }
    // if (aTime.isAfter(bTime, 'minute')) { return -1; }
    const aTime = (a.type === 'month') ? endOfMonth(parseISO(a.dateTime)).toISOString() : a.dateTime;
    const bTime = (b.type === 'month') ? endOfMonth(parseISO(b.dateTime)).toISOString() : b.dateTime;
    return bTime.localeCompare(aTime);
}

const FETCH_LIMIT = 25;

interface FetchEventsReturn {
    name: EventListName;
    listItems: EventItemType[];
    currentItem?: DayItem;
    hasMore: boolean;
    monthsSeen: string[];
    lastQuery?: string;
}

export const fetchEvents = createAsyncThunk<FetchEventsReturn, FetchEventsArguments, ThunkAPIType>(
    'calendar/fetchEvents',
    async (args, thunkAPI) => {
        const params: FetchEventsAPIParams = {
            limit: FETCH_LIMIT,
        };
        const {
            name,
            after,
            before,
            date,
            scrollTo
        } = args;

        if (date) {
            params.date = date.toISOString();
        } else if (after) {
            params.after = after.toISOString();
        } else if (before) {
            params.before = before.toISOString();
        }
        const { data: events } = await axios.get<CachedEvent[]>('/api/calendar', { params });
        const state = thunkAPI.getState().scheduleEventItems;
        const { events: listItems, monthsSeen } = transformCachedEventsToListItems(events, new Set(state[name].setOfMonths));
        let currentItem: DayItem | undefined = undefined;
        const desiredDate = date || after || before;
        // find closest event to desired date.
        if (scrollTo && desiredDate) {
            currentItem = listItems.reduce((acc: EventItemType | undefined, item: EventItemType) => {
                if (acc === undefined) {
                    if (itemIsDay(item)) {
                        return item;
                    } else {
                        return undefined;
                    }
                } else {
                    return (
                        differenceInDays(parseISO(item.dateTime), desiredDate) <
                        differenceInDays(parseISO(acc.dateTime), desiredDate) ? item : acc
                    );
                }
            }, undefined) as DayItem;
        }
        const hasMore = !!listItems.length;
        return {
            name,
            listItems,
            currentItem,
            hasMore,
            monthsSeen: [...monthsSeen],
        };
    },
    {
        condition: ({ name }, { getState }) => {
            const eventItemsReducer = getState().scheduleEventItems[name];
            return !eventItemsReducer.isFetchingList && eventItemsReducer.hasMore;
        }
    }
);

export const searchEvents = createAsyncThunk<FetchEventsReturn, SearchEventsArguments, ThunkAPIType>(
    'calendar/searchEvents',
    async ({ name, q }, _) => {
        const params = {
            q
        };

        const { data } = await axios.get<void, { data: CachedEvent[] }>('/api/calendar/search', { params });
        const { events: listItems, monthsSeen } = transformCachedEventsToListItems(data, new Set<string>());

        return {
            name,
            listItems,
            currentItem: undefined,
            hasMore: false,
            monthsSeen: [...monthsSeen],
            lastQuery: q,
        };
    },
    {
        condition: ({ q }, { getState }) => {
            const state = getState().scheduleEventItems.search;
            return (q !== '') && !state.isFetchingList && (state.hasMore || state.lastQuery !== q);
        }
    }
)

const initialState: Optional<EventItemsStateShape, 'currentItem' | 'minDate' | 'maxDate'> = {
    currentItem: undefined,
    currentLatLng: {
        lat: 39.0997,
        lng: -94.5786,
    },
    hasEventBeenSelected: false,
    isFetchingList: false,
    isFetchingLatLng: false,
    minDate: undefined,
    maxDate: undefined,
    setOfMonths: [],
    hasMore: true,
    items: [],
    lastQuery: undefined,
};

const initialScheduleState: ScheduleStateShape = {
    upcoming: initialState,
    archive: initialState,
    search: {
        ...initialState,
        lastQuery: '',
    },
};

export const clearList = createAction<EventListName>('calendar/clearList');
export const selectEvent = createAction<{ name: EventListName; event?: DayItem }>('calendar/selectEvent');

const scheduleSlice = createSlice({
    name: 'scheduleEventItems',
    initialState: initialScheduleState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(clearList, (state, action) => {
                const name = action.payload;
                state[name] = {
                    ...state[name],
                    hasMore: true,
                    isFetchingList: false,
                    items: [],
                    setOfMonths: [],
                    lastQuery: '',
                };
            })
            .addCase(selectEvent, (state, action) => {
                const { name, event } = action.payload;
                state[name].hasEventBeenSelected = true;
                state[name].currentItem = event;
            })
            .addMatcher(isAnyOf(fetchEvents.pending, searchEvents.pending), (state, action) => {
                const { name } = action.meta.arg;
                state[name].isFetchingList = true;
            })
            .addMatcher(isAnyOf(fetchEvents.rejected, searchEvents.rejected), (state, action) => {
                const { name } = action.meta.arg;
                state[name].isFetchingList = false;
            })
            .addMatcher(isAnyOf(fetchEvents.fulfilled, searchEvents.fulfilled), (state, action) => {
                const {
                    name,
                    currentItem,
                    monthsSeen,
                    hasMore,
                    lastQuery,
                    listItems
                } = action.payload;
                const sortedArray = (name === 'upcoming') ?
                    new SortedArraySet<EventItemType>(state[name].items, equals, ascendCompare) :
                    new SortedArraySet<EventItemType>(state[name].items, equals, descendCompare);
                sortedArray.addEach(listItems);
                state[name].items = sortedArray.toArray();
                // sortedArray.min() and .max() depend on sorting function, so min might actually be max if it's in descending order
                const minMaxDates = [parseISO(sortedArray.min()?.dateTime), parseISO(sortedArray.max()?.dateTime)];
                state[name] = {
                    ...state[name],
                    isFetchingList: false,
                    currentItem: currentItem || state[name].currentItem,
                    // Need to call min and max functions because of above comment
                    minDate: state[name].items.length ? min(minMaxDates).toISOString() : new Date().toISOString(),
                    maxDate: state[name].items.length ? max(minMaxDates).toISOString() : new Date().toISOString(),
                    setOfMonths: monthsSeen,
                    hasMore: hasMore,
                    lastQuery: lastQuery,
                };
            })
            .addDefaultCase(state => state);
    },
});

export const scheduleReducer = scheduleSlice.reducer;

// const eventItemsReducer: Reducer<EventItemsStateShape, ActionTypes> = (
//     state: EventItemsStateShape = initialState,
//     action: ActionTypes,
// ) => {
//     switch (action.type) {
//         case SCHEDULE_ACTIONS.CLEAR_LIST:
//             return {
//                 ...state,
//                 hasMore: true,
//                 isFetchingList: false,
//                 items: new SortedArraySet<EventItemType>([], equals, descendCompare),
//                 setOfMonths: new Set<string>(),
//                 itemArray: [],
//                 lastQuery: '',
//             };
//         case SCHEDULE_ACTIONS.FETCH_EVENTS_SUCCESS:
//             state.items.addEach(action.listItems);
//             return {
//                 ...state,
//                 itemArray: state.items.toArray(),
//                 isFetchingList: false,
//                 currentItem: action.currentItem ? action.currentItem : state.currentItem,
//                 // because of sorting mechanism, reverse list has min and max reversed
//                 minDate: state.items.length ? moment.min(state.items.min().dateTime, state.items.max().dateTime) : moment(),
//                 maxDate: state.items.length ? moment.max(state.items.min().dateTime, state.items.max().dateTime) : moment(),
//                 setOfMonths: action.setOfMonths,
//                 hasMore: action.hasMore,
//                 lastQuery: action.lastQuery,
//             };
//         case SCHEDULE_ACTIONS.FETCH_EVENTS_REQUEST:
//             return {
//                 ...state,
//                 isFetchingList: true,
//             };
//         case SCHEDULE_ACTIONS.FETCH_EVENTS_ERROR:
//             return {
//                 ...state,
//                 isFetchingList: false,
//             };
//         case SCHEDULE_ACTIONS.FETCH_LAT_LNG_REQUEST:
//             return {
//                 ...state,
//                 isFetchingLatLng: true,
//             };
//         case SCHEDULE_ACTIONS.FETCH_LAT_LNG_ERROR:
//             return {
//                 ...state,
//                 isFetchingLatLng: false,
//             };
//         case SCHEDULE_ACTIONS.FETCH_LAT_LNG_SUCCESS:
//             return {
//                 ...state,
//                 isFetchingLatLng: false,
//                 currentLatLng: { lat: action.lat, lng: action.lng },
//             };
//         case SCHEDULE_ACTIONS.SELECT_EVENT:
//             return {
//                 ...state,
//                 hasEventBeenSelected: true,
//                 currentItem: action.eventItem,
//             };
//         default:
//             return state;
//     }
// };

// const upcomingSlice = eventItemsSlice('upcoming');
// const archive = createAction('archive');
// const search = createAction('search');

// type fetchEventsTypes = AsyncThunkPayloadCreatorReturnValue<FetchEventsReturn, ThunkAPIType>;

// const actionIsFetchEvents = isAsyncThunkAction(fetchEvents);

// const scheduleSlice = createSlice({
//     name: 'scheduleEventItems',
//     initialState: initialScheduleState,
//     reducers: {},
//     extraReducers: (builder) => {
//         builder
//             .addMatcher(
//                 (action) => {
//                     if (actionIsFetchEvents(action)) {
//                         return action.meta.arg.name === 'upcoming'
//                     } else {
//                         return false;
//                     }
//                 },
//                 (state, action) => {
//                     const passState = current(state.upcoming);
//                     state.upcoming = upcomingSlice.reducer(passState, action);
//                 })
//     }
// })

// export const scheduleReducer: Reducer<ScheduleStateShape, ActionTypes> = (state: ScheduleStateShape = {
//     upcoming: {
//         ...initialState,
//         items: new SortedArraySet<EventItemType>([], equals, ascendCompare),
//     },
//     archive: {
//         ...initialState,
//         items: new SortedArraySet<EventItemType>([], equals, descendCompare),
//     },
//     search: {
//         ...initialState,
//         items: new SortedArraySet<EventItemType>([], equals, descendCompare),
//         lastQuery: '',
//     },
// }, action: ActionTypes) => {
//     switch (action.name) {
//         case 'upcoming':
//             return {
//                 ...state,
//                 upcoming: eventItemsReducer(state.upcoming, action),
//             };
//         case 'archive':
//             return {
//                 ...state,
//                 archive: eventItemsReducer(state.archive, action),
//             };
//         case 'search':
//             return {
//                 ...state,
//                 search: eventItemsReducer(state.search, action),
//             };
//         default:
//             return state;
//     }
// };
