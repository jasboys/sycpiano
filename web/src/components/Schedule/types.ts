export type EventType = 'concerto' | 'chamber' | 'solo' | 'masterclass';

export type EventListName = 'upcoming' | 'archive' | 'search' ;

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

export interface CachedEvent {
    readonly id: string;
    readonly location: string;
    readonly dateTime: string;
    readonly allDay: boolean;
    readonly endDate: string;
    readonly timezone: string;
    readonly name: string;
    readonly collaborators: Collaborators;
    readonly pieces: Pieces;
    readonly type: EventType;
    readonly website?: string;
}

export interface DayItem {
    readonly type: 'day';
    readonly id: string;
    readonly name: string;
    readonly collaborators: Collaborators;
    readonly eventType: EventType;
    readonly dateTime: string;
    readonly endDate?: string;
    readonly allDay: boolean;
    readonly location: string;
    readonly program: Pieces;
    readonly website?: string;
    readonly timezone: string;
}

export interface MonthItem {
    readonly type: 'month';
    readonly dateTime: string;
    readonly month: string;
    readonly year: number;
}

export interface LoadingItem {
    readonly type: 'loading';
}

export type EventItemType = DayItem | MonthItem;

export const itemIsDay = (item: EventItemType | LoadingItem): item is DayItem => (
    item.type === 'day'
);

export const itemIsMonth = (item: EventItemType | LoadingItem): item is MonthItem => (
    item.type === 'month'
);

export const itemIsLoading = (item: EventItemType | LoadingItem): item is LoadingItem => (
    item.type === 'loading'
);

export const itemNotLoading = (item: EventItemType | LoadingItem): item is DayItem | MonthItem => (
    item.type !== 'loading'
);

export type ScheduleStateShape = Record<EventListName, EventItemsStateShape>;

export interface EventItemsStateShape {
    items: EventItemType[];
    currentItem?: DayItem;
    currentLatLng: LatLngLiteral;
    hasEventBeenSelected: boolean;
    isFetchingList: boolean;
    isFetchingLatLng: boolean;
    minDate?: string;
    maxDate?: string;
    setOfMonths: string[];
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
    scrollTo?: boolean;
}

export interface FetchEventsAPIParams {
    date?: string;
    after?: string;
    before?: string;
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
