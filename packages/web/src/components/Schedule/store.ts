import type {
    InfiniteData,
    InfiniteQueryObserverResult,
} from '@tanstack/react-query';
import { parseISO } from 'date-fns';
import { atom, type WritableAtom } from 'jotai';
import { atomWithImmer } from 'jotai-immer';
import { atomWithInfiniteQuery } from 'jotai-tanstack-query';
import type {
    EventItem,
    EventItemsStateShape,
    EventListName,
    FetchEventsArguments,
    ScheduleStateShape,
} from 'src/components/Schedule/types';
import { partialAtomGetter } from 'src/store.js';
import {
    FETCH_LIMIT,
    fetchEvents,
    getInitFetchParams,
} from './queryFunctions.js';
import { createMonthGroups, maxOfMonthGroups, minOfMonthGroups } from './utils';

// const FETCH_LIMIT = 25;

interface FetchEventsReturn {
    pagedEvents: EventItem[][];
}

const initialState = (
    order: 'asc' | 'desc' = 'desc',
): EventItemsStateShape => ({
    minDate: undefined,
    maxDate: undefined,
    items: { order, length: 0, monthGroups: [] },
});

const initialScheduleState: ScheduleStateShape = {
    upcoming: initialState('asc'),
    archive: initialState(),
    search: {
        ...initialState(),
    },
    event: initialState(),
    isFetching: false,
    date: undefined,
};

const scheduleStore = atomWithImmer(initialScheduleState);
const currentTypeAtom = atom<EventListName>('upcoming');
const currentItemsLengthAtom = atom(
    (get) => get(scheduleStore)[get(currentTypeAtom)].items.length,
);
const lastQueryAtom = atom<string | undefined>('');

const scrollFetchParamsAtom = atom<FetchEventsArguments | undefined>((get) => {
    const type = get(currentTypeAtom);
    switch (type) {
        case 'upcoming': {
            const maxDate = get(scheduleStore).upcoming.maxDate;
            return {
                name: 'upcoming',
                after: maxDate ? parseISO(maxDate) : undefined,
            };
        }
        case 'archive': {
            const mniDate = get(scheduleStore).archive.minDate;
            return {
                name: 'archive',
                before: mniDate ? parseISO(mniDate) : undefined,
            };
        }
        case 'search':
        case 'event': {
            return undefined;
        }
        default:
            return undefined;
    }
});

export const eventsQueryAtom: WritableAtom<
    InfiniteQueryObserverResult<
        InfiniteData<EventItem[], FetchEventsArguments>,
        Error
    >,
    [],
    void
> = atomWithInfiniteQuery<
    EventItem[],
    Error,
    InfiniteData<EventItem[], FetchEventsArguments>,
    (string | undefined)[],
    FetchEventsArguments
>((get) => ({
    queryKey: ['schedule', get(currentTypeAtom), get(lastQueryAtom)],
    queryFn: async ({ pageParam }: { pageParam: FetchEventsArguments }) => {
        return await fetchEvents(pageParam);
    },
    initialPageParam: getInitFetchParams({
        type: get(currentTypeAtom),
        searchQ: get(lastQueryAtom),
        eventDate: get(scheduleStore).date,
    }),
    getNextPageParam: (_lastPage: EventItem[], allPages: EventItem[][]) => {
        const lastPage = allPages[allPages.length - 1];
        if (lastPage.length === 0 || lastPage.length !== FETCH_LIMIT) {
            return undefined;
        }
        return get(scrollFetchParamsAtom);
    },
    refetchOnWindowFocus: false,
}));

export const scheduleAtoms = {
    upcoming: atom((get) => get(scheduleStore).upcoming),
    archive: atom((get) => get(scheduleStore).archive),
    search: atom((get) => get(scheduleStore).search),
    event: atom((get) => get(scheduleStore).event),
    isFetching: partialAtomGetter(scheduleStore).toToggleAtom('isFetching'),
    currentType: currentTypeAtom,
    itemsLength: currentItemsLengthAtom,
    lastQuery: lastQueryAtom,
    eventList: atom((get) => {
        const store = get(scheduleStore)[get(currentTypeAtom)];
        return {
            eventItems: store.items,
            eventItemsLength: store.items.length,
            minDate: store.minDate,
            maxDate: store.maxDate,
        };
    }),
};

export const scheduleActions = {
    clearList: atom(null, (get, set) => {
        const listType = get(currentTypeAtom);
        set(scheduleStore, (draft) => {
            draft[listType] = {
                ...draft[listType],
                items: {
                    order: draft[listType].items.order,
                    length: 0,
                    monthGroups: [],
                },
                minDate: undefined,
                maxDate: undefined,
            };
        });
        set(lastQueryAtom, '');
    }),
    fulfilled: atom(null, (get, set, { pagedEvents }: FetchEventsReturn) => {
        set(scheduleStore, (draft) => {
            const name = get(currentTypeAtom);
            const events = pagedEvents.flat(1);
            const monthGroup = createMonthGroups(
                events,
                draft[name].items.order,
            );
            draft[name] = {
                ...draft[name],
                items: monthGroup,
                minDate:
                    monthGroup.monthGroups.length === 0
                        ? new Date().toISOString()
                        : minOfMonthGroups(monthGroup).dateTime,
                maxDate:
                    monthGroup.monthGroups.length === 0
                        ? new Date().toISOString()
                        : maxOfMonthGroups(monthGroup).dateTime,
            };
        });
    }),
};

// export const scheduleStore = createStore(
//     'scheduleEventItems',
// )<ScheduleStateShape>(initialScheduleState, zustandMiddlewareOptions)
//     .extendSelectors((_set, get, _api) => ({
//         itemsLength: (name: EventListName) => get[name]().items.length,
//         getEventList: (type: EventListName) => {
//             const name = type;
//             return {
//                 eventItems: get[name]().items,
//                 eventItemsLength: get[name]().items.length,
//                 minDate: get[name]().minDate,
//                 maxDate: get[name]().maxDate,
//                 lastQuery: get[name]().lastQuery,
//                 isSearching: get.isFetching(),
//             };
//         },
//     }))
//     .extendActions((set, _get, _api) => ({
//         clearList: (name: EventListName) => {
//             set.state((state) => {
//                 state[name] = {
//                     ...state[name],
//                     items: {
//                         order: state[name].items.order,
//                         length: 0,
//                         monthGroups: [],
//                     },
//                     minDate: undefined,
//                     maxDate: undefined,
//                     lastQuery: '',
//                 };
//             });
//         },
//         fulfilled: ({ name, lastQuery, pagedEvents }: FetchEventsReturn) => {
//             set.state((state) => {
//                 const events = pagedEvents.flat(1);
//                 const monthGroup = createMonthGroups(
//                     events,
//                     state[name].items.order,
//                 );
//                 state[name] = {
//                     ...state[name],
//                     items: monthGroup,
//                     minDate:
//                         monthGroup.monthGroups.length === 0
//                             ? new Date().toISOString()
//                             : minOfMonthGroups(monthGroup).dateTime,
//                     maxDate:
//                         monthGroup.monthGroups.length === 0
//                             ? new Date().toISOString()
//                             : maxOfMonthGroups(monthGroup).dateTime,
//                     lastQuery: lastQuery,
//                 };
//             });
//         },
//     }));
