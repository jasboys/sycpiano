import isValid from 'date-fns/isValid';
import parseISO from 'date-fns/parseISO';
import type { CachedEvent, EventItem } from 'src/components/Schedule/types';

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
): EventItem[] => {
    const eventsList = events.map((event) => {
        const parsedEndDate = parseISO(event.endDate);
        const endDate = isValid(parsedEndDate) ? parsedEndDate : undefined;

        return {
            ...event,
            endDate: endDate?.toISOString(),
        };
    });

    return eventsList;
};

export const getGoogleMapsSearchUrl = (query: string): string => `
    ${GOOGLE_MAPS_SEARCH_URL}&query=${encodeURIComponent(query)}
`;
