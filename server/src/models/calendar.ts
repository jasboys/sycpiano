import { AfterDelete, BeforeCreate, BeforeUpdate, Collection, Entity, Index, ManyToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import type { EventArgs } from '@mikro-orm/core';
import _ from 'lodash';

import { createCalendarEvent, deleteCalendarEvent, getImageFromMetaTag, getLatLng, getTimeZone, transformModelToGoogle, updateCalendar } from '../gapi/calendar.js';
import { getPhotos } from '../gapi/places.js';
import { CalendarCollaborator } from './CalendarCollaborator.js';
import { CalendarPiece } from './CalendarPiece.js';
import { CalendarSearchMatview } from './CalendarSearchMatview.js';
import { Collaborator } from './Collaborator.js';
import { Piece } from './Piece.js';

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

    @Property({ columnType: 'text', nullable: true })
    photoReference?: string;

    @Property({ columnType: 'text', nullable: true })
    placeId?: string;

    @Property({ nullable: true, default: true })
    usePlacePhoto?: boolean = true;

    @ManyToMany({ entity: () => Piece, pivotEntity: () => CalendarPiece })
    pieces = new Collection<Piece>(this);

    @ManyToMany({ entity: () => Collaborator, pivotEntity: () => CalendarCollaborator })
    collaborators = new Collection<Collaborator>(this);

    @OneToOne()
    calendarSearchMatview!: CalendarSearchMatview;

    @BeforeCreate()
    async beforeCreateHook(args: EventArgs<Calendar>) {
        console.log('[Hook: BeforeCreate] Start');
        const {
            dateTime,
            website,
            imageUrl,
            location
        } = args.entity;

        console.log(`[Hook: BeforeCreate] Fetching coord and tz for location: ${location}`);
        let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (location) {
            const { latlng } = await getLatLng(location);
            timezone = await getTimeZone(latlng.lat, latlng.lng, dateTime);
        }
        console.log(`[Hook: BeforeCreate] timezone: ${timezone}`);

        console.log(`[Hook: BeforeCreate] Fetching image url from tags`);
        if (!imageUrl && website) {
            const fetchedImageUrl = await getImageFromMetaTag(website)
            args.entity.imageUrl = fetchedImageUrl;
            args.entity.usePlacePhoto = (fetchedImageUrl === '');
        }
        console.log(`[Hook: BeforeCreate] Finished image url from tags.`);

        console.log(`[Hook: BeforeCreate] Fetching photos from Places API`);
        if (location) {
            try {
                const otherCal = await args.em.findOne(
                    Calendar,
                    {
                        $and: [
                            { location },
                            { photoReference: { $ne: null } },
                        ],
                    },
                );
                if (!!otherCal) {
                    console.log(`[Hook: BeforeCreate] Found existing photo.`);
                    args.entity.photoReference = otherCal.photoReference;
                    args.entity.placeId = otherCal.placeId;
                } else {
                    const { photoReference, placeId } = await getPhotos(location);
                    console.log(`[Hook: BeforeCreate]: Parsed photo from API.`);
                    args.entity.photoReference = photoReference;
                    args.entity.placeId = placeId;
                }
            } catch (e) {
                console.log(`[Hook: BeforeCreate] ${e}`);
                args.entity.photoReference = '';
                args.entity.placeId = '';
            }
        }
        console.log(`[Hook: BeforeCreate] Done with Places API`);

        /* eslint-disable require-atomic-updates */
        args.entity.timezone = timezone;
        /* eslint-enable require-atomic-updates */
        console.log(`[Hook: BeforeCreate] Creating google calendar event '${args.entity.name}' on ${args.entity.dateTime.toISOString()}`);
        const googleParams = await transformModelToGoogle(args.entity);
        const createResponse = await createCalendarEvent(googleParams);

        const id = createResponse.data.id;
        console.log(`[Hook: BeforeCreate] Received response id: ${id}.`);
        /* eslint-disable require-atomic-updates */
        args.entity.id = id;
        /* eslint-enable require-atomic-updates */
        console.log(`[Hook: BeforeCreate] End`);
    }

    @BeforeUpdate()
    async beforeUpdateHook(args: EventArgs<Calendar>) {
        console.log('[Hook: BeforeUpdate] Start');

        let timezone = args.entity.timezone;

        const locationChanged = !!args.changeSet?.payload?.location || timezone === null;
        const websiteChanged = !!args.changeSet?.payload?.website;
        const dateTime = args.entity.dateTime;
        const location = args.entity.location;

        if (locationChanged || timezone === undefined) {
            console.log('[Hook: BeforeUpdate] Location changed or timezone was undefined, fetching timezone');

            const location = args.entity.location;
            const { latlng } = await getLatLng(location);
            timezone = await getTimeZone(latlng.lat, latlng.lng, dateTime);
            console.log(`[Hook: BeforeUpdate] Fetched timezone: ${timezone}`);
        }

        if (timezone !== args.entity.timezone) {
            args.changeSet!.payload.timezone = timezone;
        }

        if (locationChanged) {
            console.log(`[Hook: BeforeUpdate] Fetching photos from Places API`);
            try {
                const otherCal = await args.em.findOne(
                    Calendar,
                    {
                        $and: [
                            { location },
                            { photoReference: { $ne: null } },
                        ],
                    },
                );
                if (!!otherCal) {
                    console.log(`[Hook: BeforeUpdate] Found existing photo.`);
                    args.changeSet!.payload.photoReference = otherCal.photoReference;
                    args.changeSet!.payload.placeId = otherCal.placeId;
                } else {
                    const { photoReference, placeId } = await getPhotos(location);
                    console.log(`[Hook: BeforeUpdate]: Parsed photo from API.`);
                    args.changeSet!.payload.photoReference = photoReference;
                    args.changeSet!.payload.placeId = placeId;
                }
            } catch (e) {
                console.log(`[Hook: BeforeUpdate] ${e}`);
                args.changeSet!.payload.photoReference = '';
                args.changeSet!.payload.placeId = '';
            }
            console.log(`[Hook: BeforeUpdate] Done with Places API`);
        }

        if (websiteChanged && !args.entity.imageUrl && args.entity.website) {
            console.log(`[Hook: BeforeUpdate] Fetching image url from tags`);
            const fetchedImageUrl = await getImageFromMetaTag(args.entity.website)
            args.changeSet!.payload.imageUrl = fetchedImageUrl;
            args.changeSet!.payload.usePlacePhoto = (fetchedImageUrl === '');
        }

        if (!_.isEmpty(args.changeSet?.payload)) {
            const data = await transformModelToGoogle(args.entity);
            console.log(`[Hook: BeforeUpdate] Updating google calendar event: ${args.entity.id}`);
            await updateCalendar(data);
        }
        console.log(`[Hook: BeforeUpdate] End\n`);
    }

    @AfterDelete()
    async AfterDelete(args: EventArgs<Calendar>) {
        console.log(`[Hook: AfterDelete] Start`);
        await deleteCalendarEvent(args.entity.id);
        console.log(`[Hook: AfterDelete] Deleted calendar id: ${args.entity.id}`);
    }
}

