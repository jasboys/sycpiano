import { isBefore, isValid, parseISO, startOfDay } from 'date-fns';
import * as express from 'express';
import * as sequelize from 'sequelize';
import { Op } from 'sequelize';

import db from '../models';
import { CalendarAttributes, calendar } from '../models/calendar';
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

const calendarOptionsBase: sequelize.FindOptions<CalendarAttributes> = {
    attributes: {
        exclude: ['created_at', 'updated_at', '_search', 'createdAt', 'updatedAt'],
    },
    include: calendarIncludeBase,
};


function getEventsBefore(before: Date, limit?: number) {
    return models.calendar.findAll({
        ...calendarOptionsBase,
        where: sequelize.where(sequelize.literal('date_time::date'), Op.lt, before),
        limit,
        order: [
            ['dateTime', 'DESC'],
            [models.collaborator, models.calendarCollaborator, 'order', 'ASC'],
            [models.piece, models.calendarPiece, 'order', 'ASC'],
        ],
    });
}

// Includes the date specified (greater than)
function getEventsAfter(after: Date, limit?: number) {
    return models.calendar.findAll({
        ...calendarOptionsBase,
        where: sequelize.where(sequelize.literal('date_time::date'), Op.gte, after),
        limit,
        order: [
            ['dateTime', 'ASC'],
            [models.collaborator, models.calendarCollaborator, 'order', 'ASC'],
            [models.piece, models.calendarPiece, 'order', 'ASC'],
        ],
    });
}

// The interval is open right side.
function getEventsBetween(start: Date, end: Date, order: 'ASC' | 'DESC') {
    return models.calendar.findAll({
        ...calendarOptionsBase,
        where: sequelize.and(
            sequelize.where(sequelize.literal('date_time::date'), Op.gte, start),
            sequelize.where(sequelize.literal('date_time::date'), Op.lt, end),
        ),
        order: [
            ['dateTime', order],
            [models.collaborator, models.calendarCollaborator, 'order', 'ASC'],
            [models.piece, models.calendarPiece, 'order', 'ASC'],
        ],
    });
}

function getEventAt(at: Date) {
    return models.calendar.findOne({
        ...calendarOptionsBase,
        where: sequelize.where(sequelize.literal('date_time::date'), Op.eq, at),
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
    at?: string;
}

// Hey, think about implementing before:[date] or after:[date], or even [month year] search.

calendarRouter.get('/search', async (req: express.Request<any, any, any, CalendarQuery>, res) => {
    const str = req.query.q;
    if (str === undefined || str === '') {
        res.json([]);
        return;
    }

    console.log(str);
    const tokens = str.replaceAll(', ', '|').replaceAll(/ +/g, '&');
    const splitTokens = tokens.split('|').map(t => t.split('&'));
    console.log(tokens);
    console.log(splitTokens);

    const calendarMatch: calendar[] = await db.models.calendar.findAll({
        where: {
            [Op.or]: [
                sequelize.where(
                    db.models.calendar.rawAttributes.id,
                    Op.in,
                    sequelize.literal(`(SELECT cs.id from calendar_search('${tokens}') cs)`)),
                ...splitTokens.map(t => {
                    return {
                        [Op.and]: t.map(v => {
                            return {
                                [Op.or]: [
                                    {
                                        name: {
                                            [Op.iLike]: `%${v}%`,
                                        }
                                    },
                                    {
                                        location: {
                                            [Op.iLike]: `%${v}%`,
                                        }
                                    },
                                    {
                                        type: {
                                            [Op.iLike]: `%${v}%`,
                                        }
                                    },
                                    {
                                        '$pieces.composer$': {
                                            [Op.iLike]: `%${v}%`,
                                        }
                                    },
                                    {
                                        '$pieces.piece$': {
                                            [Op.iLike]: `%${v}%`,
                                        }
                                    },
                                    {
                                        '$collaborators.name$': {
                                            [Op.iLike]: `%${v}%`,
                                        }
                                    },
                                    {
                                        '$collaborators.instrument$': {
                                            [Op.iLike]: `%${v}%`,
                                        }
                                    },
                                ]
                            };
                        }),
                    };
                }),
            ],
        },
        attributes: {
            exclude: ['created_at', 'updated_at', '_search', 'createdAt', 'updatedAt'],
        },
        include: calendarIncludeBase,
    });

    const calendarIds = calendarMatch.map((c) => c.id);

    const calendarResults = await db.models.calendar.findAll({
        where: {
            id: calendarIds,
        },
        attributes: {
            exclude: ['created_at', 'updated_at', '_search', 'createdAt', 'updatedAt'],
        },
        include: calendarIncludeBase,
        order: [
            ['dateTime', 'DESC'],
            [models.collaborator, models.calendarCollaborator, 'order', 'ASC'],
            [models.piece, models.calendarPiece, 'order', 'ASC'],
        ],
    })

    res.json(calendarResults);
});

calendarRouter.get('/', async (req: express.Request<any, any, any, CalendarQuery>, res) => {
    const model = models.calendar;

    const limit = !!req.query.limit && parseInt(req.query.limit) || undefined;
    const date = !!req.query.date && parseISO(req.query.date);
    const before = !!req.query.before && parseISO(req.query.before);
    const after = !!req.query.after && parseISO(req.query.after);
    const at = !!req.query.at && parseISO(req.query.at);

    // let type;
    const now = startOfDay(new Date());

    let response;
    let betweenEvents;
    let futureEvents;
    let pastEvents;

    console.log(req.query);
    if (at && isValid(at)) {
        response = [await getEventAt(at)];
    } else if (!date || !isValid(date)) {
        if (before && isValid(before)) {
            // type = BEFORE;
            response = await getEventsBefore(before, limit);
        } else if (after && isValid(after)) {
            // type = AFTER;
            response = await getEventsAfter(after, limit);
        } else {
            // type = ALL;
            response = await model.findAll({ include: calendarIncludeBase });
        }
    } else if (isBefore(now, date)) {
        // type = FUTURE;
        [betweenEvents, futureEvents] = await Promise.all([
            getEventsBetween(now, date, 'ASC'),
            getEventsAfter(date, 25),
        ]);
        response = [...betweenEvents, ...futureEvents];
    } else {
        // type = PAST;
        [betweenEvents, pastEvents] = await Promise.all([
            getEventsBetween(date, now, 'DESC'),
            getEventsBefore(date, 25),
        ]);
        response = [...betweenEvents.reverse(), ...pastEvents];
    }

    res.json(response);
});

export default calendarRouter;
