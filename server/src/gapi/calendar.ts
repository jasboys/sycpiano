import axios, { AxiosResponse } from 'axios';
import * as moment from 'moment';
import { getToken } from './oauth';

import { Sequelize } from 'sequelize/types';
import { GCalEvent } from '../types';

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

export const getCalendarEvents = async (sequelize: Sequelize, nextPageToken: string = null, syncToken: string = null): Promise<AxiosResponse<any>> => {
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
    startDatetime: Date | string;
    timeZone: string;
    allDay: boolean;
    endDate: Date | string;
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
    const startMoment = moment(startDatetime);
    const endMoment = moment(endDate);
    const eventResource = {
        summary,
        description,
        location,
        start: (allDay ? { date: startMoment.format('YYYY-MM-DD') } : { dateTime: startMoment.format(), timeZone }),
        end: (endDate ?
            { date: endMoment.format('YYYY-MM-DD') } :
            (allDay ?
                { date: startMoment.add({ day: 1 }).format('YYYY-MM-DD') } :
                { dateTime: startMoment.add({ hours: 2 }).format(), timeZone }
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
    const startMoment = moment(startDatetime);
    const endMoment = moment(endDate);
    const eventResource = {
        summary,
        description,
        location,
        start: (allDay ? { date: startMoment.format('YYYY-MM-DD') } : { dateTime: startMoment.format(), timeZone }),
        end: (endDate ?
            { date: endMoment.format('YYYY-MM-DD') } :
            (allDay ?
                { date: startMoment.add({ day: 1 }).format('YYYY-MM-DD') } :
                { dateTime: startMoment.add({ hours: 2 }).format(), timeZone }
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
    }
};

interface TimezoneResponse {
    timeZoneId: string;
}

export const getTimeZone = async (lat: number, lng: number, timestamp?: string | Date): Promise<string> => {
    const loc = `${lat.toString()},${lng.toString()}`;
    const url = `https://maps.googleapis.com/maps/api/timezone/json`;
    try {
        const response = await axios.get<TimezoneResponse>(url, {
            params: {
                location: loc,
                timestamp: moment(timestamp).unix(),
                key: gapiKey,
            },
        });
        return response.data.timeZoneId;
    } catch (e) {
        console.log(e);
    }
};
