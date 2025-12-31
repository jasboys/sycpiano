import {
    type EntityData,
    type FilterQuery,
    type Loaded,
    type QueryOrderMap,
    type RequiredEntityData,
    wrap,
} from '@mikro-orm/core';
import type express from 'express';
import orm from '../database.js';
import { getImageFromMetaTag } from '../gapi/calendar.js';
import { Calendar } from '../models/Calendar.js';
import { CalendarCollaborator } from '../models/CalendarCollaborator.js';
import { CalendarPiece } from '../models/CalendarPiece.js';
import { crud, setGetListHeaders } from './crud.js';
import { respondWithError } from './index.js';
import { mikroCrud } from './mikroCrud.js';
import { NotFoundError } from './types.js';

export const mapSearchFields = (token: string) =>
    [
        'location',
        'type',
        'website',
        'name',
        'pieces.composer',
        'pieces.piece',
        'collaborators.name',
        'collaborators.instrument',
    ].map((field) => {
        const split = field.split('.');
        if (split.length === 1) {
            return {
                [field]: {
                    $ilike: `%${token}%`,
                },
            };
        }
        return {
            [split[0]]: {
                $some: {
                    [split[1]]: {
                        $ilike: `%${token}%`,
                    },
                },
            },
        };
    });

const calendarRouter = crud('/calendars', {
    ...mikroCrud({ entity: Calendar }),
    create: async (body) => {
        console.log(body);
        const { dateTimeInput, ...values } =
            body as RequiredEntityData<Calendar>;
        const created = orm.em.create(Calendar, values);
        console.log(created);
        if (dateTimeInput) {
            wrap(created).assign({ dateTimeInput });
        }
        await orm.em.flush();
        return created;
    },
    update: async (id, body) => {
        const record = await orm.em.findOneOrFail(
            Calendar,
            { id },
            {
                failHandler: () => new NotFoundError(),
            },
        );
        wrap(record).assign(body as EntityData<Calendar>, {
            mergeObjectProperties: true,
        });
        console.log(record);
        await orm.em.flush();
        return record;
    },
    updateMany: async (ids, body) => {
        const [records, count] = await orm.em.findAndCount(Calendar, {
            id: { $in: ids },
        });
        for (const record of records) {
            wrap(record).assign(body, { mergeObjectProperties: true });
            console.log(record);
        }
        await orm.em.flush();
        return {
            count,
            rows: records,
        };
    },
    getOne: async (id) => {
        const cal = await orm.em.findOneOrFail(
            Calendar,
            { id },
            {
                populate: [
                    'collaborators',
                    'pieces',
                    'calendarPieces',
                    'calendarPieces.piece',
                    'calendarCollaborators',
                    'calendarCollaborators.collaborator',
                ],
            },
        );
        const { calendarPieces, calendarCollaborators, ...plainCal } =
            wrap(cal).toPOJO();
        return {
            ...plainCal,
            collaborators: calendarCollaborators.map((val) => {
                return {
                    ...val.collaborator,
                    order: val.order,
                    pivotId: val.id,
                };
            }),
            pieces: calendarPieces.map((val) => {
                return {
                    ...val.piece,
                    order: val.order,
                    pivotId: val.id,
                };
            }),
        };
    },
    getList: async ({ filter, limit, offset, order }) => {
        const cals = await orm.em.findAndCount(
            Calendar,
            filter as FilterQuery<Calendar>,
            {
                limit,
                offset,
                orderBy: order as QueryOrderMap<Calendar>,
                populate: [
                    'collaborators',
                    'pieces',
                    'calendarPieces',
                    'calendarCollaborators',
                ],
            },
        );

        return {
            count: cals[1],
            rows: cals[0].map((cal) => {
                const { calendarPieces, calendarCollaborators, ...plainCal } =
                    wrap(cal).toPOJO();
                return {
                    ...plainCal,
                    collaborators: calendarCollaborators.map((val) => {
                        return {
                            ...val.collaborator,
                            order: val.order,
                            pivotId: val.id,
                        };
                    }),
                    pieces: calendarPieces.map((val) => {
                        return {
                            ...val.piece,
                            order: val.order,
                            pivotId: val.id,
                        };
                    }),
                };
            }),
        };
    },
    search: async ({ q, limit }, _) => {
        const matchArray = q.trim().match(/^id:(.*)$/i);
        let where: FilterQuery<Calendar>;
        if (matchArray?.[1]) {
            where = {
                id: {
                    $ilike: `%${matchArray[1]}%`,
                },
            };
        } else {
            const tokens = q.trim().replaceAll(', ', '|').replaceAll(' ', '&');
            const splitTokens = tokens.split('|').map((t) => t.split('&'));
            where = {
                $or: splitTokens.map((token) => {
                    return {
                        $and: token.map((v) => {
                            return {
                                $or: mapSearchFields(v),
                            };
                        }),
                    };
                }),
            };
        }
        const calendarResults = await orm.em.findAndCount(Calendar, where, {
            populate: [
                'calendarPieces',
                'calendarPieces.piece',
                'calendarCollaborators',
                'calendarCollaborators.collaborator',
            ],
            orderBy: [{ dateTime: 'DESC' }],
            limit,
        });
        return {
            count: calendarResults[1],
            rows: calendarResults[0].map((cal) => {
                const { calendarPieces, calendarCollaborators, ...plainCal } =
                    wrap(cal).toPOJO();
                return {
                    ...plainCal,
                    collaborators: calendarCollaborators.map((val) => {
                        return {
                            ...val.collaborator,
                            order: val.order,
                            pivotId: val.id,
                        };
                    }),
                    pieces: calendarPieces.map((val) => {
                        return {
                            ...val.piece,
                            order: val.order,
                            pivotId: val.id,
                        };
                    }),
                };
            }),
        };
    },
});

const populateImages = async (entity: Calendar) => {
    try {
        const { website } = entity;
        if (website) {
            const fetchedImageUrl = await getImageFromMetaTag(website);
            if (fetchedImageUrl !== '') {
                entity.imageUrl = fetchedImageUrl;
            } else {
                entity.imageUrl = null;
            }
        }
    } catch (_e) {
        console.log('populate images error');
    }
};

calendarRouter.post(
    '/actions/calendars/populate-image-fields',
    async (req: express.Request, res: express.Response) => {
        const {
            ids,
        }: {
            ids: string[] | undefined;
        } = req.body;

        try {
            if (ids) {
                const where: FilterQuery<Calendar> = ids
                    ? {
                          id: ids,
                      }
                    : {};

                const [calendars, count] = await orm.em.findAndCount(
                    Calendar,
                    where,
                    {
                        populate: ['collaborators', 'pieces'],
                    },
                );
                for (const calendar of calendars) {
                    await populateImages(calendar);
                }
                await orm.em.flush();

                setGetListHeaders(res, count, calendars.length);
                res.status(201).json(calendars);
            } else {
                let calendars: Loaded<Calendar, never>[] = [];
                let i = 0;
                do {
                    calendars = await orm.em.find(
                        Calendar,
                        {},
                        { limit: 20, offset: i, orderBy: { id: 'ASC' } },
                    );
                    for (const calendar of calendars) {
                        await populateImages(calendar);
                    }
                    console.log(
                        `Updated ${calendars.length} calendars' images.`,
                    );
                    await orm.em.flush();
                    i += calendars.length;
                } while (calendars.length !== 0);
                console.log(`Total updated: ${i}`);

                setGetListHeaders(res, i, i);
                res.status(201);
            }
        } catch (e) {
            respondWithError(e as Error, res);
        }
    },
);

calendarRouter.post('/actions/calendars/duplicate', async (req, res) => {
    try {
        const id = req.body.id;
        const calendar = await orm.em.findOneOrFail(
            Calendar,
            { id },
            { populate: ['calendarPieces', 'calendarCollaborators'] },
        );

        const {
            name,
            dateTime,
            timezone,
            location,
            type,
            website,
            allDay,
            endDate,
            hidden,
            imageUrl,
        } = calendar;

        const newCalendar = orm.em.create(Calendar, {
            name,
            dateTime,
            timezone,
            location,
            type,
            website,
            allDay,
            endDate,
            hidden,
            imageUrl,
        });
        orm.em.persist(newCalendar);

        for (const pivot of calendar.calendarPieces) {
            const newPivot = orm.em.create(CalendarPiece, {
                calendar: newCalendar,
                piece: pivot.piece,
                order: pivot.order,
            });
            orm.em.persist(newPivot);
        }

        for (const pivot of calendar.calendarCollaborators) {
            const newPivot = orm.em.create(CalendarCollaborator, {
                calendar: newCalendar,
                collaborator: pivot.collaborator,
                order: pivot.order,
            });
            orm.em.persist(newPivot);
        }

        await orm.em.flush();

        res.json({ calendar });
    } catch (e) {
        respondWithError(e as Error, res);
    }
});

export const calendarHandler = calendarRouter;
