import { Loaded, expr } from '@mikro-orm/core';
import { isBefore, isValid, parseISO, startOfDay } from 'date-fns';
import * as express from 'express';

import orm from '../database.js';
import { Calendar } from '../models/Calendar.js';

function getEventsBefore(before: Date, limit?: number) {
    return orm.em.find(
        Calendar,
        {
            [expr('date_time::date')]: { $lt: before },
        },
        {
            limit,
            populate: ['collaborators', 'pieces'],
            orderBy: [{ dateTime: 'DESC' }],
        },
    );
}

// Includes the date specified (greater than)
function getEventsAfter(after: Date, limit?: number) {
    return orm.em.find(
        Calendar,
        {
            [expr('date_time::date')]: { $gte: after },
        },
        {
            limit,
            populate: ['collaborators', 'pieces'],
            orderBy: [{ dateTime: 'DESC' }],
        },
    );
}

// The interval is open right side.
function getEventsBetween(start: Date, end: Date, order: 'ASC' | 'DESC') {
    return orm.em.find(
        Calendar,
        {
            $and: [
                { [expr('date_time::date')]: { $gte: start } },
                { [expr('date_time::date')]: { $lt: end } },
            ],
        },
        {
            populate: ['collaborators', 'pieces'],
            orderBy: [{ dateTime: order }],
        },
    );
}

function getEventAt(at: Date) {
    return orm.em.findOneOrFail(
        Calendar,
        { [expr('date_time::date')]: at },
        {
            populate: ['collaborators', 'pieces'],
        },
    );
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

calendarRouter.get(
    '/search',
    async (req: express.Request<{}, object, {}, CalendarQuery>, res) => {
        const str = req.query.q;
        if (str === undefined || str === '') {
            res.json([]);
            return;
        }

        const ors = str.split(', ');
        const regexPattern = ors
            .map((andGroup) => {
                return andGroup
                    .split(/ +/g)
                    .map((and) => {
                        return `(?=.*${and})`;
                    })
                    .join('');
            })
            .join('|');

        const calendarResults = await orm.em.find(
            Calendar,
            {
                // calendarSearchMatview: {
                //     Search: {
                //         $fulltext: tokens,
                //     },
                // },
                calendarTrgmMatview: {
                    doc: {
                        $re: regexPattern,
                    },
                },
            },
            {
                populate: ['collaborators', 'pieces'],
                orderBy: [{ dateTime: 'DESC' }],
            },
        );

        res.json(calendarResults);
    },
);

calendarRouter.get(
    '/',
    async (req: express.Request<{}, object, {}, CalendarQuery>, res) => {
        const limit =
            (!!req.query.limit && parseInt(req.query.limit)) || undefined;
        const date = !!req.query.date && parseISO(req.query.date);
        const before = !!req.query.before && parseISO(req.query.before);
        const after = !!req.query.after && parseISO(req.query.after);
        const at = !!req.query.at && parseISO(req.query.at);

        // let type;
        const now = startOfDay(new Date());

        let response: Loaded<Calendar, 'collaborators' | 'pieces'>[];
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
                response = await orm.em.find(
                    Calendar,
                    {},
                    {
                        populate: ['collaborators', 'pieces'],
                        orderBy: [{ dateTime: 'ASC' }],
                    },
                );
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
    },
);

export default calendarRouter;
