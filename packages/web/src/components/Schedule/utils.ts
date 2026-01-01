import { tz } from '@date-fns/tz';
import binarySearch from 'binary-search';
import {
    addMonths,
    compareAsc,
    compareDesc,
    endOfMonth,
    getMonth,
    getYear,
    isSameDay,
    isSameMonth,
    isValid,
    parseISO,
    startOfMonth,
    subMonths,
} from 'date-fns';
import type {
    EventItem,
    EventItemResponse,
    HasDate,
    MonthGroup,
    MonthGroups,
} from 'src/components/Schedule/types';

const GOOGLE_MAPS_SEARCH_URL = 'https://www.google.com/maps/search/?api=1';

/*
 * We want to convert an array of EventItemType, which is raw data from api response
 * to one that has Month items injected in.
 * params:
 *  events - events to parse
 *  monthsSeen - immutable cache of months, should contain previous months seen, of the format '[month] [year]'.
 *
 * returns: map of {
 *  events: EventItemType[]
 *  monthsSeens: Set<string>
 * }
 */
export const transformCachedEventsToListItems = (
    events: EventItemResponse[],
): EventItem[] => {
    const eventsList = events.map((event) => {
        if (event.endDate) {
            const parsedEndDate = parseISO(event.endDate);
            const endDate = isValid(parsedEndDate) ? parsedEndDate : undefined;

            return {
                ...event,
                endDate: endDate?.toISOString(),
            };
        }
        return event;
    });

    return eventsList;
};

export const getGoogleMapsSearchUrl = (query: string): string => `
    ${GOOGLE_MAPS_SEARCH_URL}&query=${encodeURIComponent(query)}
`;

// function eventEquals(a: EventItem, b: EventItem) {
//     // return a.dateTime.isSame(b.dateTime, 'minute');
//     return a.dateTime === b.dateTime;
// }

export function eventAscend(a: HasDate, b: HasDate) {
    // if (a.dateTime.isSame(b.dateTime, 'minute')) { return 0; }
    // if (a.dateTime.isBefore(b.dateTime, 'minute')) { return -1; }
    // if (a.dateTime.isAfter(b.dateTime, 'minute')) { return 1; }
    return compareAsc(parseISO(a.dateTime), parseISO(b.dateTime));
}

export function eventDescend(a: HasDate, b: HasDate) {
    // if (aTime.isSame(bTime, 'minute')) { return 0; }
    // if (aTime.isBefore(bTime, 'minute')) { return 1; }
    // if (aTime.isAfter(bTime, 'minute')) { return -1; }
    return compareDesc(parseISO(a.dateTime), parseISO(b.dateTime));
}

export const minOfMonthGroups = (mg: MonthGroups) => {
    if (mg.order === 'asc') {
        return mg.monthGroups[0].events[0];
    }
    const mgLength = mg.monthGroups.length;
    const eventsLength = mg.monthGroups[mgLength - 1].events.length;
    return mg.monthGroups[mgLength - 1].events[eventsLength - 1];
};

export const maxOfMonthGroups = (mg: MonthGroups) => {
    if (mg.order === 'desc') {
        return mg.monthGroups[0].events[0];
    }
    const mgLength = mg.monthGroups.length;
    const eventsLength = mg.monthGroups[mgLength - 1].events.length;
    return mg.monthGroups[mgLength - 1].events[eventsLength - 1];
};

export const createMonthGroups = (
    events: EventItem[],
    order: 'asc' | 'desc' = 'desc',
): MonthGroups => {
    if (events.length === 0) {
        return {
            order,
            length: 0,
            monthGroups: [],
        };
    }
    if (order === 'desc') {
        const sortedEvents = events.sort(eventDescend);
        const lastMonth = startOfMonth(
            parseISO(sortedEvents[0].dateTime, {
                in: tz(sortedEvents[0].timezone),
            }),
        );
        const firstMonth = startOfMonth(
            parseISO(sortedEvents[events.length - 1].dateTime, {
                in: tz(sortedEvents[events.length - 1].timezone),
            }),
        );
        const result: MonthGroup[] = [];
        let count = 0;
        for (
            let it = lastMonth;
            it >= firstMonth && sortedEvents.length !== 0;
            it = subMonths(it, 1)
        ) {
            let pointer = binarySearch(
                sortedEvents,
                { dateTime: it.toISOString() },
                eventDescend,
            );
            if (pointer < 0) {
                pointer = -1 * pointer - 1;
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
    }
    const sortedEvents = events.sort(eventAscend);
    const firstMonth = endOfMonth(
        parseISO(sortedEvents[0].dateTime, {
            in: tz(sortedEvents[0].timezone),
        }),
    );
    const lastMonth = endOfMonth(
        parseISO(sortedEvents[events.length - 1].dateTime, {
            in: tz(sortedEvents[events.length - 1].timezone),
        }),
    );
    const result: MonthGroup[] = [];
    let count = 0;
    for (
        let it = firstMonth;
        it <= lastMonth && sortedEvents.length !== 0;
        it = addMonths(it, 1)
    ) {
        let pointer = binarySearch(
            sortedEvents,
            { dateTime: it.toISOString() },
            eventAscend,
        );
        if (pointer < 0) {
            pointer = -1 * pointer - 1;
        } else {
            pointer += 1;
        }
        const extracted = sortedEvents.splice(0, pointer);
        if (extracted.length !== 0) {
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
};

export const mergeMonthGroups = (
    left: MonthGroups,
    right: MonthGroups,
): MonthGroups => {
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
        const inLeftIdx = localLeft.monthGroups.findIndex((leftGroup) =>
            isSameMonth(parseISO(leftGroup.dateTime), parseISO(mg.dateTime)),
        );
        if (inLeftIdx !== -1) {
            const popped = localLeft.monthGroups.splice(inLeftIdx, 1)[0]; // mutate local array
            return {
                ...popped,
                events: [...popped.events, ...mg.events].sort(
                    localLeft.order === 'asc' ? eventAscend : eventDescend,
                ),
            };
        }
        return mg;
    });
    const result = [
        ...localLeft.monthGroups, // any duplicate months have been removed because of popping
        ...mergedWithExisting,
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
    const monthGroup = mgs.monthGroups.find((mg) =>
        isSameMonth(parseISO(mg.dateTime), d),
    );
    return monthGroup?.events.find((ev) =>
        isSameDay(parseISO(ev.dateTime, { in: tz(ev.timezone) }), d),
    );
};

// function monthGroupEquals(a: MonthGroup, b: MonthGroup) {
//     return isSameMonth(parseISO(a.dateTime), parseISO(b.dateTime));
// }

export function monthGroupAscend(a: MonthGroup, b: MonthGroup) {
    return compareAsc(parseISO(a.dateTime), parseISO(b.dateTime));
}

export function monthGroupDescend(a: MonthGroup, b: MonthGroup) {
    return compareDesc(parseISO(a.dateTime), parseISO(b.dateTime));
}
