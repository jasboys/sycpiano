import { FilterQuery, Loaded, wrap } from '@mikro-orm/core';
import orm from 'database.js';
import express from 'express';
import { getImageFromMetaTag } from 'gapi/calendar.js';
import { Calendar } from 'models/Calendar.js';
import { crud, setGetListHeaders } from './crud.js';
import { respondWithError } from './index.js';
import { mikroCrud } from './mikroCrud.js';

const calendarRouter = crud('/calendars', {
    ...mikroCrud({ entity: Calendar }),
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
        const cals = await orm.em.findAndCount(Calendar, filter, {
            limit,
            offset,
            orderBy: order,
            populate: [
                'collaborators',
                'pieces',
                'calendarPieces',
                'calendarPieces.piece',
                'calendarCollaborators',
                'calendarCollaborators.collaborator',
            ],
        });

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
        const matchArray = q.trim().match(/^id\:(.*)$/i);
        let where: FilterQuery<Calendar>;
        if (matchArray?.[1]) {
            where = {
                id: {
                    $ilike: `%${matchArray[1]}%`,
                },
            };
        } else {
            const ors = q.trim().split(', ');
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
            const regExp = new RegExp(regexPattern, 'i');
            where = {
                calendarTrgmMatview: {
                    doc: regExp,
                },
            };
        }
        const calendarResults = await orm.em.findAndCount(Calendar, where, {
            populate: [
                'collaborators',
                'pieces',
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
        const { website, imageUrl, location } = entity;
        if (website) {
            if (imageUrl === null) {
                const fetchedImageUrl = await getImageFromMetaTag(website);
                if (fetchedImageUrl !== '') {
                    entity.imageUrl = fetchedImageUrl;
                }
            }
        }

        if (location) {
            try {
                const otherCal = await orm.em.findOne(Calendar, {
                    $and: [
                        { location },
                        { imageUrl: { $ne: null } },
                        { imageUrl: { $ne: '' } },
                    ],
                });
                if (otherCal) {
                    entity.imageUrl = otherCal.imageUrl;
                }
            } catch (e) {
                console.log('No images to populate');
            }
        }
    } catch (e) {
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

export const calendarHandler = calendarRouter;
