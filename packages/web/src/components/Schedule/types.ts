export type EventType =
    | 'concerto'
    | 'chamber'
    | 'solo'
    | 'masterclass'
    | 'adjudication';

export const eventListNamesArr = [
    'upcoming',
    'archive',
    'search',
    'event',
] as const;

export type EventListName = (typeof eventListNamesArr)[number];

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
    readonly dateTime: string; // Can't Store Date because redux can't serializable or something...
    readonly endDate?: string; // Can't Store Date because redux can't serializable or something...
    readonly allDay: boolean;
    readonly location: string;
    readonly pieces: Pieces;
    readonly website?: string;
    readonly timezone: string;
    readonly imageUrl?: string;
}

export interface EventItemResponse extends EventItem {
    readonly endDate: string;
}

export interface LoadingItem {
    readonly type: 'loading';
}

export type ScheduleStateShape = Record<EventListName, EventItemsStateShape> & {
    isFetching: boolean;
    date?: string;
    // lastQuery?: string;
};

export interface MonthGroup {
    month: number;
    year: number;
    dateTime: string; // Make sure to run startOfMonth on creation then ISOString
    events: EventItem[];
}

export interface MonthGroups {
    order: 'asc' | 'desc';
    length: number;
    monthGroups: MonthGroup[];
}

export interface EventItemsStateShape {
    items: MonthGroups;
    minDate?: string;
    maxDate?: string;
    // lastQuery?: string;
}

// export interface SearchEventsArguments {
//     name: 'search';
//     q: string;
// }

export interface FetchEventsArguments {
    name: EventListName;
    date?: Date;
    after?: Date;
    before?: Date;
    at?: Date;
    q?: string;
}

export interface FetchEventsAPIParams {
    date?: string;
    after?: string;
    before?: string;
    at?: string;
    limit: number;
}

export interface LatLngLiteral {
    lat: number;
    lng: number;
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
