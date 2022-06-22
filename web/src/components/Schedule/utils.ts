import formatInTimeZone from 'date-fns-tz/formatInTimeZone';
import isValid from 'date-fns/isValid';
import parseISO from 'date-fns/parseISO';
import startOfMonth from 'date-fns/startOfMonth';
import { CachedEvent, EventItemType, MonthItem } from 'src/components/Schedule/types';

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
    events: CachedEvent[],
    monthsSeen: Set<string>,
): { events: EventItemType[]; monthsSeen: Set<string> } => {
    const monthsSet = new Set<string>(monthsSeen);
    const eventsList = events.reduce((runningEventsArr: EventItemType[], event) => {
        const eventDateTime = parseISO(event.dateTime);

        const monthString = formatInTimeZone(eventDateTime, event.timezone ?? 'America/Chicago', 'LLLL');
        const yearString = formatInTimeZone(eventDateTime, event.timezone ?? 'America/Chicago', 'y');
        const monthYearString = `${monthString} ${yearString}`

        const nextEventsArr: EventItemType[] = [];
        if (!monthsSet.has(monthYearString)) {
            monthsSet.add(monthYearString);
            const monthDate = startOfMonth(eventDateTime);
            nextEventsArr.push({
                type: 'month',
                dateTime: monthDate.toISOString(),
                month: monthString,
                year: parseInt(yearString, 10),
            } as MonthItem);
        }

        const parsedEndDate = parseISO(event.endDate);
        const endDate = isValid(parsedEndDate) ? parsedEndDate : undefined;

        nextEventsArr.push({
            type: 'day',
            id: event.id,
            name: event.name,
            dateTime: eventDateTime.toISOString(),
            endDate: endDate?.toISOString(),
            allDay: event.allDay,
            collaborators: event.collaborators,
            eventType: event.type,
            location: event.location,
            program: event.pieces,
            website: event.website,
            timezone: event.timezone,
        });

        return [ ...runningEventsArr, ...nextEventsArr ];
    }, []);

    return {
        events: eventsList,
        monthsSeen: monthsSet,
    };
};

export const getGoogleMapsSearchUrl = (query: string): string => `
    ${GOOGLE_MAPS_SEARCH_URL}&query=${encodeURIComponent(query)}
`;
