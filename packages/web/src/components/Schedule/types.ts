import { addMonths, compareAsc, compareDesc, endOfMonth, getMonth, getYear, isSameDay, isSameMonth, parseISO, startOfMonth, subMonths } from 'date-fns';
import binarySearch from 'binary-search';
import { utcToZonedTime } from 'date-fns-tz';

export type EventType = 'concerto' | 'chamber' | 'solo' | 'masterclass';

export const eventListNamesArr = ['upcoming', 'archive', 'search', 'event'] as const;

export type EventListName = typeof eventListNamesArr[number];

export interface Collaborator {
    name: string;
    instrument: string;
}

export interface Piece {
    composer: string;
    piece: string;
}

export type Collaborators = Collaborator[];
export type Pieces = Piece[];

export interface HasDate {
    dateTime: string;
}

export interface EventItem extends HasDate {
    readonly id: string;
    readonly name: string;
    readonly collaborators: Collaborators;
    readonly type: EventType;
    readonly dateTime: string;  // Can't Store Date because redux can't serializable or something...
    readonly endDate?: string;  // Can't Store Date because redux can't serializable or something...
    readonly allDay: boolean;
    readonly location: string;
    readonly pieces: Pieces;
    readonly website?: string;
    readonly timezone: string;
    readonly imageUrl?: string;
    readonly placeId?: string;
    readonly photoReference?: string;
    readonly usePlacePhoto: boolean;
}

export interface CachedEvent extends EventItem {
    readonly endDate: string;
}

export interface LoadingItem {
    readonly type: 'loading';
}

export type ScheduleStateShape = Record<EventListName, EventItemsStateShape>;

function eventEquals(a: EventItem, b: EventItem) {
    // return a.dateTime.isSame(b.dateTime, 'minute');
    return (a.dateTime === b.dateTime);
}

function eventAscend(a: HasDate, b: HasDate) {
    // if (a.dateTime.isSame(b.dateTime, 'minute')) { return 0; }
    // if (a.dateTime.isBefore(b.dateTime, 'minute')) { return -1; }
    // if (a.dateTime.isAfter(b.dateTime, 'minute')) { return 1; }
    return compareAsc(parseISO(a.dateTime), parseISO(b.dateTime));
}

function eventDescend(a: HasDate, b: HasDate) {
    // if (aTime.isSame(bTime, 'minute')) { return 0; }
    // if (aTime.isBefore(bTime, 'minute')) { return 1; }
    // if (aTime.isAfter(bTime, 'minute')) { return -1; }
    return compareDesc(parseISO(a.dateTime), parseISO(b.dateTime));
}

export interface MonthGroup {
    month: number;
    year: number;
    dateTime: string;  // Make sure to run startOfMonth on creation then ISOString
    events: EventItem[];
}

export interface MonthGroups {
    order: 'asc' | 'desc';
    length: number;
    monthGroups: MonthGroup[];
}

export const minOfMonthGroups = (mg: MonthGroups) => {
    if (mg.order === 'asc') {
        return mg.monthGroups[0].events[0];
    } else {
        const mgLength = mg.monthGroups.length;
        const eventsLength = mg.monthGroups[mgLength - 1].events.length;
        return mg.monthGroups[mgLength - 1].events[eventsLength - 1];
    }
};

export const maxOfMonthGroups = (mg: MonthGroups) => {
    if (mg.order === 'desc') {
        return mg.monthGroups[0].events[0];
    } else {
        const mgLength = mg.monthGroups.length;
        const eventsLength = mg.monthGroups[mgLength - 1].events.length;
        return mg.monthGroups[mgLength - 1].events[eventsLength - 1];
    }
};

// export const lengthOfMonthGroups = (mg: MonthGroups) => {
//     return mg.monthGroups.reduce((prev, curr) => {
//         return prev + curr.events.length;
//     }, 0);
// };

export const createMonthGroups = (events: EventItem[], order: 'asc' | 'desc' = 'desc'): MonthGroups => {
    if (events.length === 0) {
        return {
            order,
            length: 0,
            monthGroups: [],
        };
    }
    if (order === 'desc') {
        const sortedEvents = events.sort(eventDescend);
        const lastMonth = startOfMonth(utcToZonedTime(parseISO(sortedEvents[0].dateTime), sortedEvents[0].timezone));
        const firstMonth = startOfMonth(utcToZonedTime(parseISO(sortedEvents[events.length - 1].dateTime), sortedEvents[events.length - 1].timezone));
        const result: MonthGroup[] = [];
        let count = 0;
        for (let it = lastMonth; it >= firstMonth && sortedEvents.length !== 0; it = subMonths(it, 1)) {
            let pointer = binarySearch(sortedEvents, { dateTime: it.toISOString() }, eventDescend);
            if (pointer < 0) {
                pointer = (-1 * pointer) - 1;
            } else {
                pointer += 1;
            }
            const extracted = sortedEvents.splice(0, pointer);
            if (extracted.length !== 0) {
                result.push({
                    month: getMonth(it),
                    year: getYear(it),
                    dateTime: it.toISOString(),
                    events: extracted,
                });
                count += extracted.length;
            }
        }
        return {
            order,
            length: count,
            monthGroups: result,
        };
    } else {
        const sortedEvents = events.sort(eventAscend);
        const firstMonth = endOfMonth(utcToZonedTime(parseISO(sortedEvents[0].dateTime), sortedEvents[0].timezone));
        const lastMonth = endOfMonth(utcToZonedTime(parseISO(sortedEvents[events.length - 1].dateTime), sortedEvents[events.length - 1].timezone));
        const result: MonthGroup[] = [];
        let count = 0;
        for (let it = firstMonth; it <= lastMonth && sortedEvents.length !== 0; it = addMonths(it, 1)) {
            let pointer = binarySearch(sortedEvents, { dateTime: it.toISOString() }, eventAscend);
            if (pointer < 0) {
                pointer = (-1 * pointer) - 1;
            } else {
                pointer += 1;
            }
            const extracted = sortedEvents.splice(0, pointer);
            if(extracted.length !== 0) {
                result.push({
                    month: getMonth(it),
                    year: getYear(it),
                    dateTime: startOfMonth(it).toISOString(),
                    events: extracted,
                });
                count += extracted.length;
            }
        }
        return {
            order,
            length: count,
            monthGroups: result,
        };
    }
};

export const mergeMonthGroups = (left: MonthGroups, right: MonthGroups): MonthGroups => {
    if (left.order !== right.order) {
        throw Error('trying to merge two groups of opposite sorting order');
    }
    if (left.monthGroups.length === 0) {
        return { ...right };
    }
    if (right.monthGroups.length === 0) {
        return { ...left };
    }
    const localLeft = { ...left };
    const mergedWithExisting: MonthGroup[] = right.monthGroups.map((mg) => {
        const inLeftIdx = localLeft.monthGroups.findIndex((leftGroup) => isSameMonth(parseISO(leftGroup.dateTime), parseISO(mg.dateTime)));
        if (inLeftIdx !== -1) {
            const popped = localLeft.monthGroups.splice(inLeftIdx, 1)[0];   // mutate local array
            return {
                ...popped,
                events: [
                    ...(popped.events),
                    ...(mg.events),
                ].sort(localLeft.order === 'asc' ? eventAscend : eventDescend),
            }
        } else {
            return mg;
        }
    });
    const result = [
        ...(localLeft.monthGroups), // any duplicate months have been removed because of popping
        ...(mergedWithExisting),
    ].sort(localLeft.order === 'asc' ? monthGroupAscend : monthGroupDescend);

    return {
        order: localLeft.order,
        length: result.reduce((prev, curr) => {
            return prev + curr.events.length;
        }, 0),
        monthGroups: result,
    };
};

export const findDateInMonthGroups = (mgs: MonthGroups, d: Date) => {
    const monthGroup = mgs.monthGroups.find((mg) => isSameMonth(parseISO(mg.dateTime), d));
    return monthGroup?.events.find((ev) => isSameDay(utcToZonedTime(parseISO(ev.dateTime), ev.timezone), d));
}

function monthGroupEquals(a: MonthGroup, b: MonthGroup) {
    return isSameMonth(parseISO(a.dateTime), parseISO(b.dateTime));
}

function monthGroupAscend(a: MonthGroup, b: MonthGroup) {
    return compareAsc(parseISO(a.dateTime), parseISO(b.dateTime));
}

function monthGroupDescend(a: MonthGroup, b: MonthGroup) {
    return compareDesc(parseISO(a.dateTime), parseISO(b.dateTime));
}

export interface EventItemsStateShape {
    items: MonthGroups;
    currentLatLng: LatLngLiteral;
    isFetchingList: boolean;
    isFetchingLatLng: boolean;
    minDate?: string;
    maxDate?: string;
    hasMore: boolean;
    lastQuery?: string;
}

export interface SearchEventsArguments {
    name: 'search';
    q: string;
}

export interface FetchEventsArguments {
    name: EventListName;
    date?: Date;
    after?: Date;
    before?: Date;
    at?: Date;
}

export interface FetchEventsAPIParams {
    date?: string;
    after?: string;
    before?: string;
    at?: string;
    limit: number;
}

export interface LatLngLiteral {
    lat: number; lng: number;
}

export declare class LatLng {
    constructor(lat: number, lng: number, noWrap?: boolean);
    /* Comparison function. */
    equals(other: LatLng): boolean;
    /* Returns the latitude in degrees. */
    lat: number;
    /* Returns the longitude in degrees. */
    lng: number;
    /* Converts to string representation. */
    toString(): string;
    /* Returns a string of the form "lat,lng". We round the lat/lng values to 6 decimal places by default. */
    toUrlValue(precision?: number): string;
    /* Converts to JSON representation. This function is intended to be used via JSON.stringify. */
    toJSON(): LatLngLiteral;
}

export interface EventDateTimeProps {
    dateTime: string;
    endDate?: string;
    timezone: string;
    isMobile: boolean;
}