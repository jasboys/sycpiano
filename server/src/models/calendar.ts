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
    Optional,
    Sequelize,
} from 'sequelize';
import { ModelExport, ModelMap } from '../types';

import { createCalendarEvent, deleteCalendarEvent, getLatLng, getTimeZone, updateCalendar } from '../gapi/calendar';
import { collaborator } from './collaborator';
import { piece } from './piece';

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
}

export interface CalendarCreationAttributes extends Optional<CalendarAttributes, 'id' | 'endDate' | 'website'> {}

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
    const data = {
        id: c.id,
        summary: c.name,
        location: c.location,
        startDatetime: c.dateTime,
        endDate: c.endDate,
        allDay: c.allDay,
        timeZone: c.timezone,
        description: JSON.stringify({
            collaborators: collaborators.map((collab: { name: string; instrument: string }) => ({
                name: collab.name,
                instrument: collab.instrument,
            })),
            pieces: pieces.map((pie: { composer: string; piece: string }) => ({
                composer: pie.composer,
                piece: pie.piece,
            })),
            type: c.type,
            website: c.website,
        }),
    };
    return data;
};

const beforeCreateHook = async (c: calendar, _: any) => {
    console.log(`[Calendar Hook beforeCreate]`);
    const {
        location,
        dateTime,
        allDay,
        endDate,
        name,
        type,
        website,
    } = c;

    console.log(`Fetching coord and tz.`);
    let timezone = 'America/Chicago';
    if (location) {
        const { latlng } = await getLatLng(location);
        timezone = await getTimeZone(latlng.lat, latlng.lng, dateTime);
    }
    console.log(`Done fetching.`);
    const description = JSON.stringify({
        collaborators: [],
        pieces: [],
        type,
        website: encodeURI(website) || '',
    });

    // dateTime passed to hooks are in UTC. So we create a null-timezone moment with dateTime,
    // so that we can extract HH:mm that was put in on the GUI.
    // const dateString = moment.tz(c.dateTime, null).format('YYYY-MM-DD HH:mm');
    // Using the extract string, now create that time in the actual desired timezone.
    // const dateWithTz = moment.tz(dateString, timezone).toDate();
    console.log(c.dateTime);
    const dateWithTz = zonedTimeToUtc(utcToZonedTime(c.dateTime, c.timezone), timezone);

    if (allDay && c.endDate) {
        // const endDateString = moment(c.endDate).format('YYYY-MM-DD');
        // const endDateWithTz = moment.tz(endDateString, timezone).toDate();
        const endDateWithTz = zonedTimeToUtc(startOfDay(utcToZonedTime(c.endDate, c.timezone)), timezone);
        /* eslint-disable-next-line require-atomic-updates */
        c.endDate = endDateWithTz;
    }

    console.log(`Creating google calendar event '${name}' on ${dateTime}.\n`);
    const createResponse = await createCalendarEvent(c.sequelize, {
        summary: name,
        description,
        location,
        startDatetime: dateWithTz,
        endDate,
        allDay,
        timeZone: timezone,
    });

    const id = createResponse.data.id;
    console.log(`Received response id: ${id}.`);
    /* eslint-disable require-atomic-updates */
    c.id = id;
    c.location = location;
    c.timezone = timezone;
    c.dateTime = dateWithTz;
    /* eslint-enable require-atomic-updates */
    console.log(`[End Hook]\n`);
};

const beforeUpdateHook = async (c: calendar, _: any) => {
    console.log(`[Calendar Hook beforeUpdate]`);

    const dateTimeChanged = c.changed('dateTime') || c.timezone === null;
    const locationChanged = c.changed('location') || c.timezone === null;

    let timezone = c.timezone;
    // If location has changed, fetch the new timezone.
    if (locationChanged || timezone === undefined) {
        console.log(`Fetching new coord and tz.`);
        const location = c.location;
        const { latlng } = await getLatLng(location);
        timezone = await getTimeZone(latlng.lat, latlng.lng, c.dateTime);
        console.log(timezone);
    }

    // See create hook for dateTime parsing logic.
    if (dateTimeChanged) {
        console.log(`New dateTime.`);
        console.log(c.dateTime);
        // const dateString = moment.tz(c.dateTime, c.previous('timezone')).format('YYYY-MM-DD HH:mm');
        // const dateWithTz = moment.tz(dateString, timezone).toDate();
        const previous = c.previous('timezone') || 'America/Chicago';
        const dateWithTz = zonedTimeToUtc(utcToZonedTime(c.dateTime, previous), timezone);
        /* eslint-disable require-atomic-updates */
        c.dateTime = dateWithTz;
        c.timezone = timezone;
        /* eslint-enable require-atomic-updates */
        console.log(c);
    } else {
        // Here, since dateTime was unchanged, we're not being fed an input number, forced into UTC.
        // Instead, we have a time in a destination timezone. So, we extract the number we want, then
        // create a new time in the new timezone.
        if (locationChanged) {
            console.log(`Updating dateTime with new tz.`);
            // const dateString = moment(c.dateTime).tz(c.timezone).format('YYYY-MM-DD HH:mm');
            // const dateWithTz = moment.tz(dateString, timezone).toDate();
            const previous = c.previous('timezone') || 'America/Chicago';
            const dateWithTz = zonedTimeToUtc(utcToZonedTime(c.dateTime, previous), timezone);
            /* eslint-disable require-atomic-updates */
            c.dateTime = dateWithTz;
            c.timezone = timezone;
            /* eslint-enable require-atomic-updates */
            console.log(c);
        }
    }

    if (c.allDay && c.endDate && c.changed('endDate')) {
        // const endDateString = moment(c.endDate).format('YYYY-MM-DD');
        // const endDateWithTz = moment.tz(endDateString, timezone).toDate();
        const endDateWithTz = zonedTimeToUtc(startOfDay(utcToZonedTime(c.endDate, c.timezone)), timezone);
        /* eslint-disable-next-line require-atomic-updates */
        c.endDate = endDateWithTz;
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
