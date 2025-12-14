import axios from 'axios';
import { parseISO, startOfDay } from 'date-fns';
import type {
    EventItemResponse,
    EventListName,
    FetchEventsAPIParams,
    FetchEventsArguments,
} from './types.js';
import { transformCachedEventsToListItems } from './utils.js';

export const FETCH_LIMIT = 25;

const fetchDateParam = (type: string) =>
    type === 'upcoming' ? 'after' : 'before';

// export const getScrollFetchParams = (
//     type: EventListName,
// ): FetchEventsArguments | undefined => {
//     switch (type) {
//         case 'upcoming': {
//             const maxDate = scheduleStore.get.upcoming().maxDate;
//             return {
//                 name: 'upcoming',
//                 after: maxDate ? parseISO(maxDate) : undefined,
//             };
//         }
//         case 'archive': {
//             const mniDate = scheduleStore.get.archive().minDate;
//             return {
//                 name: 'archive',
//                 before: mniDate ? parseISO(mniDate) : undefined,
//             };
//         }
//         case 'search':
//         case 'event': {
//             return undefined;
//         }
//         default:
//             return undefined;
//     }
// };

interface GetInitFetchParamsArgs {
    type: EventListName;
    searchQ?: string;
    eventDate?: string;
}

export const getInitFetchParams = ({
    type,
    searchQ,
    eventDate,
}: GetInitFetchParamsArgs): FetchEventsArguments => {
    switch (type) {
        case 'upcoming':
        case 'archive': {
            return {
                name: type,
                [fetchDateParam(type)]: startOfDay(new Date()),
            };
        }
        case 'event': {
            return {
                name: 'event',
                at: eventDate ? parseISO(eventDate) : undefined,
            };
        }

        case 'search': {
            return {
                name: 'search',
                q: searchQ,
            };
        }
    }
};

export const fetchEvents = async (args: FetchEventsArguments) => {
    const { name, after, before, date, at, q } = args;
    // if (get[name]().isFetchingList || !get[name]().hasMore) {
    //     return;
    // }
    if (name !== 'search') {
        const params: FetchEventsAPIParams = {
            limit: FETCH_LIMIT,
        };

        if (date) {
            params.date = date.toISOString();
        } else if (after) {
            params.after = after.toISOString();
        } else if (before) {
            params.before = before.toISOString();
        } else if (at) {
            params.at = at.toISOString();
        }
        const { data: cachedEvents } = await axios.get<EventItemResponse[]>(
            '/api/calendar',
            { params },
        );
        const events = transformCachedEventsToListItems(cachedEvents);

        return events;
    }
    const params = {
        q,
    };

    const { data } = await axios.get<EventItemResponse[]>(
        '/api/calendar/search',
        { params },
    );
    const events = transformCachedEventsToListItems(data);

    return events;
};
