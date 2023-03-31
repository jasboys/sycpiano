import { startOfDay } from 'date-fns';
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz';
import {
    BelongsToManyAddAssociationMixin,
    BelongsToManyAddAssociationsMixin,
    BelongsToManyCountAssociationsMixin,
    BelongsToManyCreateAssociationMixin,
    BelongsToManyGetAssociationsMixin,
    BelongsToManyRemoveAssociationMixin,
    BelongsToManyRemoveAssociationsMixin,
    BelongsToManySetAssociationsMixin,
    DataTypes,
    Model,
    ModelStatic,
    Optional,
    Sequelize,
    Op,
} from 'sequelize';
import { ModelExport, ModelMap } from '../types';

import { createCalendarEvent, deleteCalendarEvent, getLatLng, getTimeZone, GoogleCalendarParams, updateCalendar } from '../gapi/calendar';
import { collaborator } from './collaborator';
import { piece } from './piece';
import axios, { AxiosError } from 'axios';
import { JSDOM } from 'jsdom';
import { getPhotos } from '../gapi/places';

export interface CalendarAttributes {
    id: string;
    name: string;
    dateTime: Date;
    allDay: boolean;
    endDate: Date;
    timezone: string;
    location: string;
    type: string;
    website: string;
    imageUrl: string | null;
    placeId: string | null;
    photoReference: string | null;
    usePlacePhoto: boolean;
}

type OptionalAttributes = 'id' | 'endDate' | 'website' | 'imageUrl' | 'placeId' | 'photoReference' | 'usePlacePhoto';

export interface CalendarCreationAttributes extends Optional<CalendarAttributes, OptionalAttributes> { }

export class calendar extends Model<CalendarAttributes, CalendarCreationAttributes> implements CalendarAttributes {
    declare id: string;
    declare name: string;
    declare dateTime: Date;
    declare allDay: boolean;
    declare endDate: Date;
    declare timezone: string;
    declare location: string;
    declare type: string;
    declare website: string;
    declare imageUrl: string | null;
    declare placeId: string | null;
    declare photoReference: string | null;
    declare usePlacePhoto: boolean;
    declare readonly collaborators?: collaborator[];
    declare readonly pieces?: piece[];
    declare readonly createdAt?: Date | string;
    declare readonly updatedAt?: Date | string;

    declare getPieces: BelongsToManyGetAssociationsMixin<piece>;
    declare setPieces: BelongsToManySetAssociationsMixin<piece, piece['id']>;
    declare addPiece: BelongsToManyAddAssociationMixin<piece, piece['id']>;
    declare addPieces: BelongsToManyAddAssociationsMixin<piece, piece['id']>;
    declare removePiece: BelongsToManyRemoveAssociationMixin<piece, piece['id']>;
    declare removePieces: BelongsToManyRemoveAssociationsMixin<piece, piece['id']>;
    declare countPieces: BelongsToManyCountAssociationsMixin;
    declare createPiece: BelongsToManyCreateAssociationMixin<piece>;

    declare getCollaborators: BelongsToManyGetAssociationsMixin<collaborator>;
    declare setCollaborators: BelongsToManySetAssociationsMixin<collaborator, collaborator['id']>;
    declare addCollaborator: BelongsToManyAddAssociationMixin<collaborator, collaborator['id']>;
    declare addCollaborators: BelongsToManyAddAssociationsMixin<collaborator, collaborator['id']>;
    declare removeCollaborator: BelongsToManyRemoveAssociationMixin<collaborator, collaborator['id']>;
    declare removeCollaborators: BelongsToManyRemoveAssociationsMixin<collaborator, collaborator['id']>;
    declare countCollaborators: BelongsToManyCountAssociationsMixin;
    declare createCollaborator: BelongsToManyCreateAssociationMixin<collaborator>;
}

const transformModelToGoogle = async (c: calendar) => {
    const collaborators = await c.getCollaborators();
    const pieces = await c.getPieces();
    const data: GoogleCalendarParams = {
        summary: c.name,
        location: c.location,
        startDatetime: c.dateTime,
        endDate: c.endDate,
        allDay: c.allDay,
        timeZone: c.timezone,
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
            website: encodeURI(c.website),
            imageUrl: encodeURI(c.imageUrl ?? ''),
            placeId: c.placeId,
            photoReference: c.photoReference,
        }),
    };
    if (!!c.id) {
        data.id = c.id;
    }
    return data;
};

export const getImageFromMetaTag = async (website: string) => {
    try {
        const page = await axios.get<string>(website);
        const { document } = new JSDOM(page.data).window;
        return document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')
            ?? document.querySelector('meta[property="og:image"]')?.getAttribute('content')
            ?? '';
    } catch (e) {
        // console.log(e);
        try {
            // Even if website doesn't exist anymore
            // Response could contain usable images.
            const err = e as AxiosError<string>;
            const page = err.response?.data;
            const { document } = new JSDOM(page).window;
            return document.querySelector('meta[name="twitter:image"]')?.getAttribute('content')
                ?? document.querySelector('meta[property="og:image"]')?.getAttribute('content')
                ?? '';
        } catch (ee) {
            // Really can't use it.
            console.log(ee);
            return '';
        }
    }
};

const beforeCreateHook = async (c: calendar, _: any) => {
    console.log(`[Calendar Hook beforeCreate]`);
    const {
        dateTime,
        website,
        imageUrl,
    } = c;

    console.log(`Fetching coord and tz.`);
    let timezone = 'America/Chicago';
    if (c.location) {
        const { latlng } = await getLatLng(c.location);
        timezone = await getTimeZone(latlng.lat, latlng.lng, dateTime);
    }
    console.log(`Done fetching.`);

    console.log('Fetching image url from tags');
    if (!imageUrl && website) {
        const fetchedImageUrl = await getImageFromMetaTag(website)
        c.imageUrl = fetchedImageUrl;
        if (fetchedImageUrl !== '') {
            c.usePlacePhoto = false;
        }
    }

    console.log('Fetching photos from places');
    if (c.location) {
        try {
            const otherCal = await (c.sequelize.models.calendar as ModelStatic<calendar>).findOne({
                where: {
                    [Op.and]: {
                        location: c.location,
                        photoReference: {
                            [Op.not]: null,
                        },
                    },
                },
            });
            if (!!otherCal) {
                console.log('found existing location photo');
                /* eslint-disable require-atomic-updates */
                c.photoReference = otherCal.photoReference;
                c.placeId = otherCal.placeId;
                /* eslint-enable require-atomic-updates */
            } else {
                const { photoReference, placeId } = await getPhotos(c.location);
                /* eslint-disable require-atomic-updates */
                c.photoReference = photoReference;
                c.placeId = placeId;
                /* eslint-enable require-atomic-updates */
            }
        } catch (e) {
            console.log(e);
            c.photoReference = '';
            c.placeId = '';
        }
    }

    // convert to event timezone, since sequelize will use default Date object, which defaults to
    // server timezone.
    const dateWithTz = zonedTimeToUtc(utcToZonedTime(c.dateTime, c.timezone), timezone);

    if (c.allDay && !!c.endDate) {
        const endDateWithTz = zonedTimeToUtc(startOfDay(utcToZonedTime(c.endDate, c.timezone)), timezone);
        /* eslint-disable-next-line require-atomic-updates */
        c.endDate = endDateWithTz;
    }

    /* eslint-disable require-atomic-updates */
    c.timezone = timezone;
    c.dateTime = dateWithTz;
    /* eslint-enable require-atomic-updates */
    console.log(`Creating google calendar event '${c.name}' on ${c.dateTime.toISOString()}.\n`);
    const googleParams = await transformModelToGoogle(c);
    const createResponse = await createCalendarEvent(c.sequelize, googleParams);

    const id = createResponse.data.id;
    console.log(`Received response id: ${id}.`);
    /* eslint-disable require-atomic-updates */
    c.id = id;
    /* eslint-enable require-atomic-updates */
    console.log(`[End Hook]\n`);
};

const beforeUpdateHook = async (c: calendar, _: any) => {
    console.log(`[Calendar Hook beforeUpdate]`);

    // const dateTimeChanged = c.changed('dateTime') || c.timezone === null;
    const locationChanged = c.changed('location') || c.timezone === null;
    const websiteChanged = c.changed('website');

    let timezone = c.timezone;
    // If location has changed, fetch the new timezone.
    if (locationChanged || timezone === undefined) {
        console.log(`Fetching new coord and tz.`);
        const location = c.location;
        const { latlng } = await getLatLng(location);
        timezone = await getTimeZone(latlng.lat, latlng.lng, c.dateTime);
        console.log(timezone);
    }

    // We're going to always re-convert timezone, just in case.
    console.log(`Updating dateTime with new tz.`);
    const previous = c.previous('timezone') || 'America/Chicago';
    const dateWithTz = zonedTimeToUtc(utcToZonedTime(c.dateTime, previous), timezone);
    /* eslint-disable require-atomic-updates */
    console.log(dateWithTz);
    c.dateTime = dateWithTz;
    c.timezone = timezone;
    /* eslint-enable require-atomic-updates */

    if (locationChanged) {
        try {
            const otherCal = await (c.sequelize.models.calendar as ModelStatic<calendar>).findOne({
                where: {
                    [Op.and]: {
                        location: c.location,
                        photoReference: {
                            [Op.not]: null,
                        },
                    },
                },
            });
            if (!!otherCal) {
                console.log('found existing location photo');
                /* eslint-disable require-atomic-updates */
                c.photoReference = otherCal.photoReference;
                c.placeId = otherCal.placeId;
                /* eslint-enable require-atomic-updates */
            } else {
                const { photoReference, placeId } = await getPhotos(c.location);
                /* eslint-disable require-atomic-updates */
                c.photoReference = photoReference;
                c.placeId = placeId;
                /* eslint-enable require-atomic-updates */
            }
        } catch (e) {
            console.log(e);
            c.photoReference = '';
            c.placeId = '';
        }
    }

    if (c.allDay && c.endDate && c.changed('endDate')) {
        const endDateWithTz = zonedTimeToUtc(startOfDay(utcToZonedTime(c.endDate, c.timezone)), timezone);
        /* eslint-disable-next-line require-atomic-updates */
        c.endDate = endDateWithTz;
    }

    if (websiteChanged && !c.imageUrl && c.website) {
        console.log('Fetching image url from tags');
        const fetchedImageUrl = await getImageFromMetaTag(c.website)
        c.imageUrl = fetchedImageUrl;
        c.usePlacePhoto = (fetchedImageUrl === ''); // If didn't get any imageUrl, then we should use place photo
    }

    if (c.changed()) {
        const data = await transformModelToGoogle(c);
        console.log(`Updating google calendar event: ${c.id}.`);
        await updateCalendar(c.sequelize, data);
    }
    console.log(`[End Hook]\n`);
};

export default (sequelize: Sequelize, dataTypes: typeof DataTypes): ModelExport<calendar> => {
    calendar.init({
        id: {
            autoIncrement: false,
            primaryKey: true,
            type: dataTypes.STRING,
            unique: true,
        },
        name: dataTypes.STRING,
        dateTime: {
            type: dataTypes.DATE,
            field: 'date_time',
        },
        allDay: {
            type: dataTypes.BOOLEAN,
            field: 'all_day',
        },
        endDate: {
            type: dataTypes.DATEONLY,
            field: 'end_date',
        },
        timezone: dataTypes.STRING,
        location: dataTypes.STRING,
        type: dataTypes.STRING,
        website: dataTypes.STRING,
        imageUrl: {
            type: dataTypes.STRING,
            field: 'image_url',
        },
        placeId: {
            type: dataTypes.STRING,
            field: 'place_id',
        },
        photoReference: {
            type: dataTypes.STRING,
            field: 'photo_reference',
        },
        usePlacePhoto: {
            type: dataTypes.BOOLEAN,
            field: 'use_place_photo',
            defaultValue: true,
        }
    }, {
        hooks: {
            beforeCreate: beforeCreateHook,
            afterDestroy: async (c: calendar, _: any) => {
                console.log(`[Calendar Hook afterDestroy]`);
                await deleteCalendarEvent(c.sequelize, c.id);
                console.log(`[End Hook]\n`);
            },
            beforeUpdate: beforeUpdateHook,
        },
        sequelize,
        tableName: 'calendar',
    });

    const associate = (models: ModelMap) => {
        calendar.hasMany(models.calendarPiece);
        calendar.hasMany(models.calendarCollaborator);
        calendar.belongsToMany(models.piece, { through: models.calendarPiece });
        calendar.belongsToMany(models.collaborator, { through: models.calendarCollaborator });
    };

    return {
        model: calendar,
        associate,
    };
};
