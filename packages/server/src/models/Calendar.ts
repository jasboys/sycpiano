import {
    AfterDelete,
    AfterUpdate,
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
import { parse, startOfDay } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

async function beforeCreateHook(args: EventArgs<Calendar>) {
    console.log('[Hook: BeforeCreate] Start');
    const { dateTimeInput, website, imageUrl, location } = args.entity;

    console.log(
        `[Hook: BeforeCreate] Fetching coord and tz for location: ${location}`,
    );
    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (location) {
        const { latlng } = await getLatLng(location);
        const dayStart = dateTimeInput
            ? startOfDay(parse(dateTimeInput, 'yyyy-MM-dd HH:mm', new Date()))
            : undefined;
        timezone = await getTimeZone(latlng.lat, latlng.lng, dayStart);
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
    if (dateTimeInput) {
        args.entity.dateTime = fromZonedTime(
            parse(dateTimeInput, 'yyyy-MM-dd HH:mm', new Date()),
            timezone,
        );
    }
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

    let timezone = args.changeSet.entity.timezone;

    const locationChanged =
        !!args.changeSet?.payload?.location || timezone === null;
    const websiteChanged = !!args.changeSet?.payload?.website;
    const location = args.changeSet.entity.location;
    const dateTimeInput = args.changeSet.entity.dateTimeInput;

    if (locationChanged || timezone === undefined) {
        console.log(
            '[Hook: BeforeUpdate] Location changed or timezone was undefined, fetching timezone',
        );

        const location = args.changeSet.entity.location;
        const { latlng } = await getLatLng(location);
        const dayStart = dateTimeInput
            ? startOfDay(parse(dateTimeInput, 'yyyy-MM-dd HH:mm', new Date()))
            : undefined;
        timezone = await getTimeZone(latlng.lat, latlng.lng, dayStart);
        console.log(`[Hook: BeforeUpdate] Fetched timezone: ${timezone}`);
    }

    if (timezone !== args.changeSet.originalEntity?.timezone) {
        args.changeSet.payload.timezone = timezone;
        args.changeSet.entity.timezone = timezone;
    }

    const newDateTime =
        dateTimeInput !== undefined
            ? fromZonedTime(
                  parse(dateTimeInput, 'yyyy-MM-dd HH:mm', new Date()),
                  timezone,
              )
            : undefined;

    if (
        newDateTime !== undefined &&
        newDateTime !== args.changeSet.originalEntity?.dateTime
    ) {
        args.changeSet.payload.dateTime = newDateTime;
        args.changeSet.entity.dateTime = newDateTime;
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
                args.changeSet.entity.imageUrl = otherCal.imageUrl;
            }
        } catch (e) {
            console.log(`[Hook: BeforeUpdate] ${e}`);
        }
        console.log('[Hook: BeforeUpdate] Done with Places API');
    }

    if (
        websiteChanged &&
        !args.changeSet.entity.imageUrl &&
        args.changeSet.entity.website
    ) {
        console.log('[Hook: BeforeUpdate] Fetching image url from tags');
        const fetchedImageUrl = await getImageFromMetaTag(
            args.changeSet.entity.website,
        );
        if (fetchedImageUrl !== '') {
            args.changeSet.payload.imageUrl = fetchedImageUrl;
            args.changeSet.entity.imageUrl = fetchedImageUrl;
        }
    }

    console.log('[Hook: BeforeUpdate] End\n');
}

async function afterUpdateHook(args: EventArgs<Calendar>) {
    const data = transformModelToGoogle(args.entity);
    console.log(
        `[Hook: AfterUpdate] Updating google calendar event: ${args.entity.id}`,
    );
    await updateCalendar(args.em, data);
    console.log('[Hook: AfterUpdate] End\n');
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

    @Property({ persist: false })
    dateTimeInput?: string;

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

    @AfterUpdate()
    async afterUpdate(args: EventArgs<Calendar>) {
        await afterUpdateHook(args);
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
