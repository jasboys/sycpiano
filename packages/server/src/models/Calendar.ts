import {
    AfterDelete,
    BeforeCreate,
    BeforeUpdate,
    Collection,
    Entity,
    Index,
    ManyToMany,
    OneToMany,
    OneToOne,
    PrimaryKey,
    Property,
} from '@mikro-orm/core';
import type { EventArgs } from '@mikro-orm/core';
import { isEmpty } from 'lodash-es';

import {
    createCalendarEvent,
    deleteCalendarEvent,
    getImageFromMetaTag,
    getLatLng,
    getTimeZone,
    transformModelToGoogle,
    updateCalendar,
} from '../gapi/calendar.js';
import { CalendarCollaborator } from './CalendarCollaborator.js';
import { CalendarPiece } from './CalendarPiece.js';
import { Collaborator } from './Collaborator.js';
import { Piece } from './Piece.js';
import { CalendarTrgmMatview } from './CalendarTrgmMatview.js';

async function beforeCreateHook(args: EventArgs<Calendar>) {
    console.log('[Hook: BeforeCreate] Start');
    const { dateTime, website, imageUrl, location } = args.entity;

    console.log(
        `[Hook: BeforeCreate] Fetching coord and tz for location: ${location}`,
    );
    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (location) {
        const { latlng } = await getLatLng(location);
        timezone = await getTimeZone(latlng.lat, latlng.lng, dateTime);
    }
    console.log(`[Hook: BeforeCreate] timezone: ${timezone}`);

    console.log('[Hook: BeforeCreate] Fetching photos from existing places');
    if (location) {
        try {
            const otherCal = await args.em.findOne(Calendar, {
                $and: [
                    { location },
                    { imageUrl: { $ne: null } },
                    { imageUrl: { $ne: '' } },
                ],
            });
            if (otherCal) {
                console.log('[Hook: BeforeCreate] Found existing photo.');
                args.entity.imageUrl = otherCal.imageUrl;
            }
            // else {
            //     const { photoReference, placeId } = await getPhotos(location);
            //     console.log('[Hook: BeforeCreate]: Parsed photo from API.');
            //     args.entity.photoReference = photoReference;
            //     args.entity.placeId = placeId;
            // }
        } catch (e) {
            console.log(`[Hook: BeforeCreate] ${e}`);
        }
    }
    console.log('[Hook: BeforeCreate] Done with Places');

    console.log('[Hook: BeforeCreate] Fetching image url from tags');
    if (!imageUrl && website) {
        const fetchedImageUrl = await getImageFromMetaTag(website);
        if (fetchedImageUrl !== '') {
            args.entity.imageUrl = fetchedImageUrl;
        }
    }
    console.log('[Hook: BeforeCreate] Finished image url from tags.');

    /* eslint-disable require-atomic-updates */
    args.entity.timezone = timezone;
    /* eslint-enable require-atomic-updates */
    console.log(
        `[Hook: BeforeCreate] Creating google calendar event '${
            args.entity.name
        }' on ${args.entity.dateTime.toISOString()}`,
    );
    const googleParams = transformModelToGoogle(args.entity);
    const createResponse = await createCalendarEvent(args.em, googleParams);

    const id = createResponse.data.id;
    console.log(`[Hook: BeforeCreate] Received response id: ${id}.`);
    /* eslint-disable require-atomic-updates */
    args.entity.id = id;
    /* eslint-enable require-atomic-updates */
    console.log('[Hook: BeforeCreate] End');
}

async function beforeUpdateHook(args: EventArgs<Calendar>) {
    if (!args.changeSet) {
        return Promise.resolve();
    }
    console.log('[Hook: BeforeUpdate] Start');

    let timezone = args.entity.timezone;

    const locationChanged =
        !!args.changeSet?.payload?.location || timezone === null;
    const websiteChanged = !!args.changeSet?.payload?.website;
    const dateTime = args.entity.dateTime;
    const location = args.entity.location;

    if (locationChanged || timezone === undefined) {
        console.log(
            '[Hook: BeforeUpdate] Location changed or timezone was undefined, fetching timezone',
        );

        const location = args.entity.location;
        const { latlng } = await getLatLng(location);
        timezone = await getTimeZone(latlng.lat, latlng.lng, dateTime);
        console.log(`[Hook: BeforeUpdate] Fetched timezone: ${timezone}`);
    }

    if (timezone !== args.entity.timezone) {
        args.changeSet.payload.timezone = timezone;
    }

    if (locationChanged) {
        console.log('[Hook: BeforeUpdate] Fetching photos from Places API');
        try {
            const otherCal = await args.em.findOne(Calendar, {
                $and: [
                    { location },
                    { imageUrl: { $ne: null } },
                    { imageUrl: { $ne: '' } },
                ],
            });
            if (otherCal) {
                console.log('[Hook: BeforeUpdate] Found existing photo.');
                args.changeSet.payload.imageUrl = otherCal.imageUrl;
            }
            // else {
            //     const { photoReference, placeId } = await getPhotos(location);
            //     console.log('[Hook: BeforeUpdate]: Parsed photo from API.');
            //     args.changeSet.payload.photoReference = photoReference;
            //     args.changeSet.payload.placeId = placeId;
            // }
        } catch (e) {
            console.log(`[Hook: BeforeUpdate] ${e}`);
        }
        console.log('[Hook: BeforeUpdate] Done with Places API');
    }

    if (websiteChanged && !args.entity.imageUrl && args.entity.website) {
        console.log('[Hook: BeforeUpdate] Fetching image url from tags');
        const fetchedImageUrl = await getImageFromMetaTag(args.entity.website);
        if (fetchedImageUrl !== '') {
            args.changeSet.payload.imageUrl = fetchedImageUrl;
        }
    }

    if (!isEmpty(args.changeSet?.payload)) {
        const data = transformModelToGoogle(args.entity);
        console.log(
            `[Hook: BeforeUpdate] Updating google calendar event: ${args.entity.id}`,
        );
        await updateCalendar(args.em, data);
    }
    console.log('[Hook: BeforeUpdate] End\n');
}

@Entity()
export class Calendar {
    @PrimaryKey({ columnType: 'text' })
    id!: string;

    @Property({ columnType: 'text', nullable: true })
    name!: string;

    @Index({ name: 'calendar_time' })
    @Property({ length: 6, nullable: true })
    dateTime!: Date;

    @Property({ columnType: 'text', nullable: true })
    timezone!: string;

    @Property({ columnType: 'text', nullable: true })
    location!: string;

    @Property({ columnType: 'text', nullable: true })
    type!: string;

    @Property({ columnType: 'text', nullable: true })
    website?: string;

    @Property({ default: false })
    allDay!: boolean;

    @Property({ columnType: 'date', nullable: true })
    endDate?: string;

    @Property({ columnType: 'text', nullable: true })
    imageUrl?: string;

    @OneToMany({
        entity: () => CalendarPiece,
        mappedBy: (cp) => cp.calendar,
        orphanRemoval: true,
        orderBy: { order: 'ASC' },
    })
    calendarPieces = new Collection<CalendarPiece>(this);

    @OneToMany({
        entity: () => CalendarCollaborator,
        mappedBy: (cp) => cp.calendar,
        orphanRemoval: true,
        orderBy: { order: 'ASC' },
    })
    calendarCollaborators = new Collection<CalendarCollaborator>(this);

    @ManyToMany({
        entity: () => Piece,
        pivotEntity: () => CalendarPiece,
        fixedOrderColumn: 'order',
    })
    pieces = new Collection<Piece>(this);

    @ManyToMany({
        entity: () => Collaborator,
        pivotEntity: () => CalendarCollaborator,
        fixedOrderColumn: 'order',
    })
    collaborators = new Collection<Collaborator>(this);

    @OneToOne({
        entity: () => CalendarTrgmMatview,
        joinColumn: 'id',
        nullable: true,
    })
    calendarTrgmMatview?: CalendarTrgmMatview;

    @BeforeCreate()
    async beforeCreate(args: EventArgs<Calendar>) {
        await beforeCreateHook(args);
    }

    @BeforeUpdate()
    async beforeUpdate(args: EventArgs<Calendar>) {
        await beforeUpdateHook(args);
    }

    @AfterDelete()
    async AfterDelete(args: EventArgs<Calendar>) {
        console.log('[Hook: AfterDelete] Start');
        await deleteCalendarEvent(args.em, args.entity.id);
        console.log(
            `[Hook: AfterDelete] Deleted calendar id: ${args.entity.id}`,
        );
    }
}
