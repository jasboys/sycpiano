import axios, { type AxiosError, type AxiosResponse } from 'axios';
import { add, format, getUnixTime } from 'date-fns';
import { JSDOM } from 'jsdom';

// import { Calendar } from '../models/orm/Calendar.js';
import type { EntityManager } from '@mikro-orm/core';
import type { Calendar } from '../models/Calendar.js';
import type { GCalEvent } from '../types.js';
import { getToken } from './oauth.js';

// From google api console; use general dev or server prod keys for respective environments.
// Make sure it's set in .env
const gapiKey = process.env.GAPI_KEY_SERVER;

const calendarId =
    process.env.NODE_ENV === 'production' && process.env.SERVER_ENV !== 'test'
        ? 'qdoiu1uovuc05c4egu65vs9uck@group.calendar.google.com'
        : 'c7dolt217rdb9atggl25h4fspg@group.calendar.google.com';
const uriEncCalId = calendarId;

export const getCalendarSingleEvent = async (
    em: EntityManager,
    id: string,
): Promise<AxiosResponse<GCalEvent>> => {
    const token = await getToken(em);
    const url = `https://www.googleapis.com/calendar/v3/calendars/${uriEncCalId}/events/${id}`;
    return axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

interface EventsListResponse {
    items: GCalEvent[];
    nextPageToken: string;
    nextSyncToken: string;
}

export const getCalendarEvents = async (
    em: EntityManager,
    nextPageToken?: string,
    syncToken?: string,
): Promise<AxiosResponse<EventsListResponse>> => {
    const token = await getToken(em);
    const url = `https://www.googleapis.com/calendar/v3/calendars/${uriEncCalId}/events`;
    return axios.get(url, {
        params: {
            singleEvents: true,
            pageToken: nextPageToken,
            syncToken,
        },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const deleteCalendarEvent = async (
    em: EntityManager,
    id: string,
): Promise<AxiosResponse<unknown>> => {
    const token = await getToken(em);
    const url = `https://www.googleapis.com/calendar/v3/calendars/${uriEncCalId}/events/${id}`;
    return axios.delete(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export interface GoogleCalendarParams {
    id?: string;
    summary: string;
    description: string;
    location: string;
    startDatetime: Date;
    timeZone: string;
    allDay: boolean;
    endDate?: Date;
}

export const createCalendarEvent = async (
    em: EntityManager,
    {
        summary,
        description,
        location,
        startDatetime,
        timeZone,
        allDay,
        endDate,
    }: GoogleCalendarParams,
): Promise<AxiosResponse<{ id: string }>> => {
    const token = await getToken(em);
    const url = `https://www.googleapis.com/calendar/v3/calendars/${uriEncCalId}/events`;
    const eventResource = {
        summary,
        description,
        location,
        start: allDay
            ? { date: format(startDatetime, 'yyyy-MM-dd') }
            : { dateTime: startDatetime.toISOString(), timeZone },
        end: endDate
            ? { date: format(endDate, 'yyyy-MM-dd') }
            : allDay
              ? { date: format(add(startDatetime, { days: 1 }), 'yyyy-MM-dd') }
              : {
                    dateTime: add(startDatetime, { hours: 2 }).toISOString(),
                    timeZone,
                },
    };
    return axios.post(url, eventResource, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const updateCalendar = async (
    em: EntityManager,
    {
        id,
        summary,
        description,
        location,
        startDatetime,
        timeZone,
        allDay,
        endDate,
    }: GoogleCalendarParams,
): Promise<AxiosResponse<unknown>> => {
    try {
        const token = await getToken(em);
        const url = `https://www.googleapis.com/calendar/v3/calendars/${uriEncCalId}/events/${id}`;
        const eventResource = {
            summary,
            description,
            location,
            start: allDay
                ? { date: format(startDatetime, 'yyyy-MM-dd') }
                : { dateTime: startDatetime.toISOString(), timeZone },
            end: endDate
                ? { date: format(endDate, 'yyyy-MM-dd') }
                : allDay
                  ? {
                        date: format(
                            add(startDatetime, { days: 1 }),
                            'yyyy-MM-dd',
                        ),
                    }
                  : {
                        dateTime: add(startDatetime, {
                            hours: 2,
                        }).toISOString(),
                        timeZone,
                    },
        };
        return axios.put(url, eventResource, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    } catch (e) {
        console.log('error writing to google calendar');
        return Promise.reject();
    }
};

export const extractEventDescription = (
    event: GCalEvent,
): Record<string, unknown> => {
    try {
        return JSON.parse(event.description);
    } catch (e) {
        console.log(e);
        console.log('======Error parsing event description JSON======');
        console.log(event.description);
        return {};
    }
};

interface GeocodeResponse {
    results: {
        geometry: {
            location: {
                lat: number;
                lng: number;
            };
        };
        formattedAddress: string;
    }[];
}

export const getLatLng = async (
    address: string,
): Promise<{
    latlng: { lat: number; lng: number };
    formattedAddress: string;
}> => {
    const geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json';
    try {
        const response = await axios.get<GeocodeResponse>(geocodeUrl, {
            params: {
                address,
                key: gapiKey,
            },
        });
        return {
            latlng: response.data.results[0].geometry.location,
            formattedAddress: response.data.results[0].formattedAddress,
        };
    } catch (e) {
        console.log(e);
        throw e;
    }
};

interface TimezoneResponse {
    timeZoneId: string;
}

export const getTimeZone = async (
    lat: number,
    lng: number,
    timestamp?: Date,
): Promise<string> => {
    const loc = `${lat.toString()},${lng.toString()}`;
    const url = 'https://maps.googleapis.com/maps/api/timezone/json';
    try {
        const response = await axios.get<TimezoneResponse>(url, {
            params: {
                location: loc,
                timestamp: getUnixTime(timestamp ?? new Date()),
                key: gapiKey,
            },
        });
        return response.data.timeZoneId;
    } catch (e) {
        console.log(e);
        throw e;
    }
};

export const transformModelToGoogle = (c: Calendar) => {
    const collaborators = c.collaborators.toArray();
    const pieces = c.pieces.toArray();
    const data: GoogleCalendarParams = {
        summary: c.name,
        location: c.location,
        startDatetime: c.dateTime,
        endDate: c.endDate ? new Date(c.endDate) : undefined,
        allDay: c.allDay,
        timeZone: c.timezone ?? '',
        description: JSON.stringify({
            collaborators: collaborators.map(({ name, instrument }) => ({
                name,
                instrument,
            })),
            pieces: pieces.map(({ composer, piece }) => ({
                composer,
                piece,
            })),
            type: c.type,
            website: encodeURI(c.website ?? ''),
            imageUrl: encodeURI(c.imageUrl ?? ''),
        }),
    };
    if (c.id) {
        data.id = c.id;
    }
    return data;
};

export const getImageFromMetaTag = async (website: string) => {
    let image: string = '';
    let page: string | undefined;
    try {
        page = (await axios.get<string>(website)).data;
    } catch (e) {
        const err = e as AxiosError<string>;
        page = err.response?.data;
    }

    try {
        const { document } = new JSDOM(page).window;
        image =
            document
                .querySelector('meta[name="twitter:image"]')
                ?.getAttribute('content') ??
            document
                .querySelector('meta[property="og:image"]')
                ?.getAttribute('content') ??
            '';
        if (image) {
            await axios.get(image);
        }
    } catch (e) {
        console.log('JSOM error or Image does not exist');
        image = '';
    }

    return image;
};
