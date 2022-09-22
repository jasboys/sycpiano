import {
    CachedEvent,
    EventItem,
    EventItemsStateShape,
    EventListName,
    FetchEventsAPIParams,
    FetchEventsArguments,
    ScheduleStateShape,
    SearchEventsArguments,
    createMonthGroups,
    mergeMonthGroups,
    minOfMonthGroups,
    maxOfMonthGroups,
} from 'src/components/Schedule/types';
import { createSlice, createAsyncThunk, createAction, isAnyOf } from '@reduxjs/toolkit';
import { ThunkAPIType } from 'src/types';
import axios from 'axios';

import { transformCachedEventsToListItems } from './utils';
import parseISO from 'date-fns/parseISO';
import differenceInDays from 'date-fns/differenceInDays';

// addEvents(events: EventItem[]) {
//     const groupedByMonths = tidy(
//         events,
//         groupBy((event: EventItem) => {
//             const zonedTime = utcToZonedTime(event.dateTime, event.timezone);
//             const month = getMonth(zonedTime);
//             const year = getYear(zonedTime);
//             return { month, year };
//         })
//     );

// }

// constructor(equalFn: (a: MonthGroup, b: MonthGroup) => boolean, compareFn: (a: MonthGroup, b: MonthGroup) => number) {
//     this.monthGroups = new SortedArraySet<MonthGroup>([], equalFn, compareFn);
// }

const FETCH_LIMIT = 25;

interface FetchEventsReturn {
    name: EventListName;
    events: EventItem[];
    currentItem?: EventItem;
    hasMore: boolean;
    lastQuery?: string;
}

export const fetchEvents = createAsyncThunk<FetchEventsReturn, FetchEventsArguments, ThunkAPIType>(
    'calendar/fetchEvents',
    async (args, _thunkAPI) => {
        const params: FetchEventsAPIParams = {
            limit: FETCH_LIMIT,
        };
        const {
            name: name,
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
        const { data: cachedEvents } = await axios.get<CachedEvent[]>('/api/calendar', { params });
        const events = transformCachedEventsToListItems(cachedEvents);
        let currentItem: EventItem | undefined = undefined;
        const desiredDate: Date | undefined = date || after || before;
        // find closest event to desired date.
        if (scrollTo && desiredDate) {
            currentItem = events.reduce((acc: EventItem | undefined, item: EventItem) => {
                if (acc === undefined) {
                    return item;
                }
                return (
                    differenceInDays(parseISO(item.dateTime), desiredDate) <
                    differenceInDays(parseISO(acc.dateTime), desiredDate) ? item : acc
                );
            }, undefined);
        }
        const hasMore = !!events.length;
        return {
            name,
            events,
            currentItem,
            hasMore,
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
        const events = transformCachedEventsToListItems(data);

        return {
            name,
            events,
            currentItem: undefined,
            hasMore: false,
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

const initialState = (order: 'asc' | 'desc' = 'desc'): EventItemsStateShape => ({
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
    hasMore: true,
    lastQuery: undefined,
    items: { order, length: 0, monthGroups: [] },
});

const initialScheduleState: ScheduleStateShape = {
    upcoming: initialState('asc'),
    archive: initialState(),
    search: {
        ...initialState(),
        lastQuery: '',
    },
};

export const clearList = createAction<EventListName>('calendar/clearList');
export const selectEvent = createAction<{ name: EventListName; event?: EventItem }>('calendar/selectEvent');

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
                    items: { order: state[name].items.order, length: 0, monthGroups: [] },
                    minDate: undefined,
                    maxDate: undefined,
                    lastQuery: '',
                };
            })
            .addCase(selectEvent, (state, action) => {
                const { name, event } = action.payload;
                state[name].hasEventBeenSelected = true;
                state[name].currentItem = event;
            })
            .addCase(searchEvents.pending, (state, _action) => {
                state.search.isFetchingList = true;
                state.search.items = { order: state.search.items.order, length: 0, monthGroups: [] }
                state.search.maxDate = undefined;
                state.search.minDate = undefined;
            })
            .addCase(fetchEvents.pending, (state, action) => {
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
                    hasMore,
                    lastQuery,
                    events
                } = action.payload;
                const newMonthGroup = createMonthGroups(events, state[name].items.order);
                const mergedItems = mergeMonthGroups(state[name].items, newMonthGroup);
                state[name] = {
                    ...state[name],
                    isFetchingList: false,
                    currentItem: currentItem || state[name].currentItem,
                    items: mergedItems,
                    minDate: mergedItems.monthGroups.length === 0 ? new Date().toISOString() : minOfMonthGroups(mergedItems).dateTime,
                    maxDate: mergedItems.monthGroups.length === 0 ? new Date().toISOString() : maxOfMonthGroups(mergedItems).dateTime,
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
