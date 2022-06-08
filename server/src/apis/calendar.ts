import { isBefore, parseISO, startOfDay } from 'date-fns';
import * as express from 'express';
import * as sequelize from 'sequelize';
import { Op } from 'sequelize';

import db from '../models';
import { calendar } from '../models/calendar';
const models = db.models;

// const { and, eq, gt, lt, or } = Sequelize.Op;
// const { gt, lt } = Sequelize.Op;

const calendarIncludeBase = [
    {
        model: models.collaborator,
        attributes: {
            exclude: ['id', 'created_at', 'updated_at', 'createdAt', 'updatedAt', 'calendarCollaborators', '_search'],
        },
        through: {
            attributes: ['order'],
        },
    },
    {
        model: models.piece,
        attributes: {
            exclude: ['id', 'created_at', 'updated_at', 'createdAt', 'updatedAt', 'calendarPieces', '_search'],
        },
        through: {
            attributes: ['order'],
        },
    },
];

function getEventsBefore(before: string | Date, limit?: number) {
    return models.calendar.findAll({
        attributes: {
            exclude: ['created_at', 'updated_at', 'createdAt', 'updatedAt'],
        },
        include: calendarIncludeBase,
        where: {
            dateTime: {
                [Op.lt]: before,
            },
        },
        limit,
        order: [
            ['dateTime', 'DESC'],
            [models.collaborator, models.calendarCollaborator, 'order', 'ASC'],
            [models.piece, models.calendarPiece, 'order', 'ASC'],
        ],
    });
}

// Includes the date specified (greater than)
function getEventsAfter(after: string | Date, limit?: number) {
    return models.calendar.findAll({
        attributes: {
            exclude: ['created_at', 'updated_at', 'createdAt', 'updatedAt'],
        },
        include: calendarIncludeBase,
        where: {
            dateTime: {
                [Op.gt]: after,
            },
        },
        limit,
        order: [
            ['dateTime', 'ASC'],
            [models.collaborator, models.calendarCollaborator, 'order', 'ASC'],
            [models.piece, models.calendarPiece, 'order', 'ASC'],
        ],
    });
}

// The interval is open side.
function getEventsBetween(start: string | Date, end: string | Date, order: 'ASC' | 'DESC') {
    return models.calendar.findAll({
        attributes: {
            exclude: ['created_at', 'updated_at', 'createdAt', 'updatedAt'],
        },
        include: calendarIncludeBase,
        where: {
            dateTime: {
                [Op.gt]: start,
                [Op.lt]: end,
            },
        },
        order: [
            ['dateTime', order],
            [models.collaborator, models.calendarCollaborator, 'order', 'ASC'],
            [models.piece, models.calendarPiece, 'order', 'ASC'],
        ],
    });
}

// const AFTER = 2;
// const FUTURE = 1;
// const ALL = 0;
// const PAST = -1;
// const BEFORE = -2;

const calendarRouter = express.Router({ mergeParams: true });

interface CalendarQuery {
    q?: string;
    before?: string;
    after?: string;
    date?: string;
    limit?: string;
}

calendarRouter.get('/search', async (req: express.Request<any, any, any, CalendarQuery>, res) => {
    const str = req.query.q;
    if (str === undefined || str === '') {
        res.json([]);
        return;
    }
    // let idArray: string[];
    // if (str) {
    //     const tokens = str.replace(', ', '|').replace(' ', '&');

    //     const ids: calendar[] = await db.sequelize.query(`
    //         SELECT cs.* FROM calendar_search('beethoven') cs
    //         LEFT OUTER JOIN LATERAL (
    //             "calendar_piece" cp
    //             INNER JOIN "piece" AS p
    //                 ON p.id = cp.piece_id
    //         ) ON cp.calendar_id = cs.id
    //         LEFT OUTER JOIN LATERAL (
    //             "calendar_collaborator" cc
    //             INNER JOIN "collaborator" AS c
    //                 ON c.id = cc.collaborator_id
    //         ) ON cc.calendar_id = cs.id
    //     `, {
    //             replacements: { query: tokens },
    //             type: Sequelize.QueryTypes.SELECT,
    //         });

    //     console.log(ids);
    //     idArray = ids.map(({ id }) => id);
    // }

    // const before = req.query.before ? moment(req.query.before) : undefined;
    // const after = req.query.after ? moment(req.query.after) : undefined;
    // const date = req.query.date ? moment(req.query.date) : undefined;

    // let where: {
    //     id?: string[];
    //     dateTime?: any;
    // } = (str) ? {
    //     id: idArray,
    // } : {};
    // if (date) {
    //     where = {
    //         dateTime: {
    //             [eq]: date,
    //         },
    //     };
    // } else if (before && after) {
    //     const arr = [
    //         { [lt]: before },
    //         { [gt]: after },
    //     ];
    //     let op;
    //     if (before.isBefore(after)) {
    //         op = or;
    //     } else {
    //         op = and;
    //     }
    //     where = {
    //         dateTime: {
    //             [op]: arr,
    //         },
    //     };
    // } else if (before) {
    //     where = {
    //         dateTime: {
    //             [lt]: before,
    //         },
    //     };
    // } else if (after) {
    //     where = {
    //         dateTime: {
    //             [gt]: after,
    //         },
    //     };
    // }

    // if (str) {
    //     const tokens = str.replace(', ', '|').replace(' ', '&');

    //     const ids: calendar[] = await db.sequelize.query(`
    //         SELECT * FROM calendar_search(:query)
    //         WHERE
    //     `, {
    //             replacements: { query: tokens },
    //             type: Sequelize.QueryTypes.SELECT,
    //         });

    //     console.log(ids);
    //     idArray = ids.map(({ id }) => id);
    // }
    const tokens = str.replaceAll(', ', '|').replaceAll(' ', '&');

    const calendarResults: calendar[] = await db.models.calendar.findAll({
        where: sequelize.where(
            calendar.rawAttributes.id,
            Op.in,
            sequelize.literal(`(SELECT cs.id from calendar_search('${tokens}') cs)`)),
        attributes: {
            exclude: ['created_at', 'updated_at', '_search', 'createdAt', 'updatedAt'],
        },
        include: calendarIncludeBase,
        order: [
            ['dateTime', 'DESC'],
            [models.collaborator, models.calendarCollaborator, 'order', 'ASC'],
            [models.piece, models.calendarPiece, 'order', 'ASC'],
        ],
    });

    res.json(calendarResults);
});

calendarRouter.get('/', async (req: express.Request<any, any, any, CalendarQuery>, res) => {
    const model = models.calendar;

    const limit = (req.query.limit === undefined) ? undefined : parseInt(req.query.limit);
    const date = req.query.date;
    const before = req.query.before;
    const after = req.query.after;

    // let type;
    const parsedDate = (date === undefined) ? undefined : parseISO(date);
    const now = startOfDay(new Date());

    let response;
    let betweenEvents;
    let futureEvents;
    let pastEvents;

    if (parsedDate === undefined) {
        if (before) {
            // type = BEFORE;
            response = await getEventsBefore(before, limit);
        } else if (after) {
            // type = AFTER;
            response = await getEventsAfter(after, limit);
        } else {
            // type = ALL;
            response = await model.findAll({ include: calendarIncludeBase });
        }
    } else if (isBefore(now, parsedDate)) {
        // type = FUTURE;
        [betweenEvents, futureEvents] = await Promise.all([
            getEventsBetween(now.toISOString(), parsedDate, 'ASC'),
            getEventsAfter(parsedDate, 25),
        ]);
        response = [...betweenEvents, ...futureEvents];
    } else {
        // type = PAST;
        [betweenEvents, pastEvents] = await Promise.all([
            getEventsBetween(parsedDate, now.toISOString(), 'DESC'),
            getEventsBefore(parsedDate, 25),
        ]);
        response = [...betweenEvents.reverse(), ...pastEvents];
    }

    // switch (type) {
    //     case FUTURE:
    //         [betweenEvents, futureEvents] = await Promise.all([
    //             getEventsBetween(now.toISOString(), date!, 'ASC'),
    //             getEventsAfter(date, 25),
    //         ]);
    //         response = [...betweenEvents, ...futureEvents];
    //         break;
    //     case PAST:
    //         [betweenEvents, pastEvents] = await Promise.all([
    //             getEventsBetween(date, now.toISOString(), 'DESC'),
    //             getEventsBefore(date, 25),
    //         ]);
    //         response = [...betweenEvents.reverse(), ...pastEvents];
    //         break;
    //     case ALL:
    //         response = await model.findAll({ include: calendarIncludeBase });
    //         break;
    //     case AFTER:
    //         response = await getEventsAfter(after, limit);
    //         break;
    //     case BEFORE:
    //         response = await getEventsBefore(before, limit);
    //         break;
    //     default:
    //         break;
    // }

    res.json(response);
});

export default calendarRouter;
