import axios, { AxiosResponse } from 'axios';
import { getToken } from './oauth';

import { Sequelize } from 'sequelize';
import { GCalEvent } from '../types';
import { add, format, getUnixTime } from 'date-fns';

// From google api console; use general dev or server prod keys for respective environments.
// Make sure it's set in .env
const gapiKey = process.env.GAPI_KEY_SERVER;

const calendarId = (process.env.NODE_ENV === 'production' && process.env.SERVER_ENV !== 'test')
    ? 'qdoiu1uovuc05c4egu65vs9uck@group.calendar.google.com'
    : 'c7dolt217rdb9atggl25h4fspg@group.calendar.google.com';
const uriEncCalId = encodeURIComponent(calendarId);

export const getCalendarSingleEvent = async (sequelize: Sequelize, id: string): Promise<AxiosResponse<any>> => {
    const token = await getToken(sequelize);
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

export const getCalendarEvents = async (sequelize: Sequelize, nextPageToken?: string, syncToken?: string): Promise<AxiosResponse<EventsListResponse>> => {
    const token = await getToken(sequelize);
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

export const deleteCalendarEvent = async (sequelize: Sequelize, id: string): Promise<AxiosResponse<any>> => {
    const token = await getToken(sequelize);
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
    endDate: Date;
}

export const createCalendarEvent = async (sequelize: Sequelize, {
    summary,
    description,
    location,
    startDatetime,
    timeZone,
    allDay,
    endDate,
}: GoogleCalendarParams): Promise<AxiosResponse<any>> => {
    const token = await getToken(sequelize);
    const url = `https://www.googleapis.com/calendar/v3/calendars/${uriEncCalId}/events`;
    const eventResource = {
        summary,
        description,
        location,
        start: (allDay ?
            { date: format(startDatetime, 'yyyy-MM-dd') } :
            { dateTime: startDatetime.toISOString(), timeZone }),
        end: (endDate ?
            { date: endDate } :
            (allDay ?
                { date: format(add(startDatetime, { days: 1 }), 'yyyy-MM-dd') } :
                { dateTime: add(startDatetime, { hours: 2 }).toISOString(), timeZone }
            )
        ),
    };
    return axios.post(url, eventResource, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const updateCalendar = async (sequelize: Sequelize, {
    id,
    summary,
    description,
    location,
    startDatetime,
    timeZone,
    allDay,
    endDate,
}: GoogleCalendarParams): Promise<AxiosResponse<any>> => {
    const token = await getToken(sequelize);
    const url = `https://www.googleapis.com/calendar/v3/calendars/${uriEncCalId}/events/${id}`;
    const eventResource = {
        summary,
        description,
        location,
        start: (allDay ?
            { date: format(startDatetime, 'yyyy-MM-dd') } :
            { dateTime: startDatetime.toISOString(), timeZone }),
        end: (endDate ?
            { date: endDate } :
            (allDay ?
                { date: format(add(startDatetime, { days: 1 }), 'yyyy-MM-dd') } :
                { dateTime: add(startDatetime, { hours: 2 }).toISOString(), timeZone }
            )
        ),
    };
    return axios.put(url, eventResource, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};

export const extractEventDescription = (event: GCalEvent): Record<string, unknown> => {
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

export const getLatLng = async (address: string): Promise<{ latlng: { lat: number; lng: number }; formattedAddress: string }> => {
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

export const getTimeZone = async (lat: number, lng: number, timestamp?: Date): Promise<string> => {
    const loc = `${lat.toString()},${lng.toString()}`;
    const url = `https://maps.googleapis.com/maps/api/timezone/json`;
    try {
        const response = await axios.get<TimezoneResponse>(url, {
            params: {
                location: loc,
                timestamp: getUnixTime(timestamp || new Date()),
                key: gapiKey,
            },
        });
        return response.data.timeZoneId;
    } catch (e) {
        console.log(e);
        throw e;
    }
};
