import type {
    EventItem,
    EventItemsStateShape,
    EventListName,
    ScheduleStateShape,
} from 'src/components/Schedule/types';
import { createMonthGroups, maxOfMonthGroups, minOfMonthGroups } from './utils';
import { createStore } from 'zustand-x';
import { zustandMiddlewareOptions } from 'src/utils';

// const FETCH_LIMIT = 25;

interface FetchEventsReturn {
    name: EventListName;
    pagedEvents: EventItem[][];
    lastQuery?: string;
}

const initialState = (
    order: 'asc' | 'desc' = 'desc',
): EventItemsStateShape => ({
    minDate: undefined,
    maxDate: undefined,
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
    event: initialState(),
    isFetching: false,
};

export const scheduleStore = createStore('scheduleEventItems')(
    initialScheduleState,
    zustandMiddlewareOptions,
)
    .extendSelectors((_set, get, _api) => ({
        itemsLength: (name: EventListName) => get[name]().items.length,
    }))
    .extendActions((set, _get, _api) => ({
        clearList: (name: EventListName) => {
            set.state((state) => {
                state[name] = {
                    ...state[name],
                    items: {
                        order: state[name].items.order,
                        length: 0,
                        monthGroups: [],
                    },
                    minDate: undefined,
                    maxDate: undefined,
                    lastQuery: '',
                };
            });
        },
        fulfilled: ({ name, lastQuery, pagedEvents }: FetchEventsReturn) => {
            set.state((state) => {
                const events = pagedEvents.flat(1);
                const monthGroup = createMonthGroups(
                    events,
                    state[name].items.order,
                );
                state[name] = {
                    ...state[name],
                    items: monthGroup,
                    minDate:
                        monthGroup.monthGroups.length === 0
                            ? new Date().toISOString()
                            : minOfMonthGroups(monthGroup).dateTime,
                    maxDate:
                        monthGroup.monthGroups.length === 0
                            ? new Date().toISOString()
                            : maxOfMonthGroups(monthGroup).dateTime,
                    lastQuery: lastQuery,
                };
            });
        },
    }));
