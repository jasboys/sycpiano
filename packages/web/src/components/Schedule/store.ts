import { type Atom, atom } from 'jotai';
import { atomWithImmer } from 'jotai-immer';
import type {
    EventItem,
    EventItemsStateShape,
    EventListName,
    ScheduleStateShape,
} from 'src/components/Schedule/types';
import { partialAtomGetter } from 'src/store.js';
import { createMonthGroups, maxOfMonthGroups, minOfMonthGroups } from './utils';

interface FetchEventsReturn {
    pagedEvents: EventItem[][];
    type: EventListName;
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
// const currentTypeAtom = atom<EventListName>('upcoming');
const currentItemsLengthAtoms: Record<EventListName, Atom<number>> = {
    upcoming: atom((get) => get(scheduleStore).upcoming.items.length),
    archive: atom((get) => get(scheduleStore).archive.items.length),
    event: atom((get) => get(scheduleStore).event.items.length),
    search: atom((get) => get(scheduleStore).search.items.length),
};
const lastQueryAtom = atom<string | undefined>('');

export const upcomingMaxDate = atom(
    (get) => get(scheduleStore).upcoming.maxDate,
);
export const archiveMinDate = atom((get) => get(scheduleStore).archive.minDate);

export const scheduleAtoms = {
    upcoming: atom((get) => get(scheduleStore).upcoming),
    archive: atom((get) => get(scheduleStore).archive),
    search: atom((get) => get(scheduleStore).search),
    event: atom((get) => get(scheduleStore).event),
    isFetching: partialAtomGetter(scheduleStore).toToggleAtom('isFetching'),

    itemsLength: currentItemsLengthAtoms,
    lastQuery: lastQueryAtom,
    date: partialAtomGetter(scheduleStore).toWriteAtom('date'),
};

export const scheduleActions = {
    fulfilled: atom(
        null,
        (_get, set, { pagedEvents, type }: FetchEventsReturn) => {
            set(scheduleStore, (draft) => {
                const events = pagedEvents.flat(1);
                const monthGroup = createMonthGroups(
                    events,
                    draft[type].items.order,
                );
                draft[type].items = monthGroup;
                draft[type].minDate =
                    monthGroup.monthGroups.length === 0
                        ? new Date().toISOString()
                        : minOfMonthGroups(monthGroup).dateTime;
                draft[type].maxDate =
                    monthGroup.monthGroups.length === 0
                        ? new Date().toISOString()
                        : maxOfMonthGroups(monthGroup).dateTime;
            });
        },
    ),
};
