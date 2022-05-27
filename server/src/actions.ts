import * as Promise from 'bluebird';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as stripeClient from './stripe';
import axios, { AxiosError } from 'axios';

dotenv.config();

import {
    createCalendarEvent,
    getCalendarSingleEvent,
    updateCalendar } from './gapi/calendar';
import db from './models';
import { calendar } from './models/calendar';
import { RequestWithBody, respondWithError } from './rest';

const actionsRouter = express.Router();

actionsRouter.post('/calendar/sync-selected', async (req: RequestWithBody, res: express.Response) => {
    let updated = 0;
    let created = 0;
    let errored = 0;

    const ids: string[] = req.body.data.attributes.ids;
    console.log(`ids: ${ids.toString()}`);
    console.log('Getting local events from db...\n');
    const models = db.models;
    try {
        const events = await models.calendar.findAll({
            where: {
                id: ids,
            },
            attributes: {
                exclude: ['createdAt', 'updatedAt', 'calendarCollaborator', 'calendarPiece'],
            },
            include: [
                {
                    model: models.collaborator,
                    attributes: {
                        exclude: ['id', 'createdAt', 'updatedAt', 'calendarCollaborator'],
                    },
                    through: {
                        attributes: ['order'],
                    },
                    include: [{
                        model: models.calendarCollaborator,
                        attributes: ['order'],
                    }],
                },
                {
                    model: models.piece,
                    attributes: {
                        exclude: ['id', 'createdAt', 'updatedAt', 'calendarPiece'],
                    },
                    through: {
                        attributes: ['order'],
                    },
                    include: [{
                        model: models.calendarPiece,
                        attributes: ['order'],
                    }],
                },
            ],
            order: [
                ['dateTime', 'DESC'],
                [models.collaborator, models.calendarCollaborator, 'order', 'ASC'],
                [models.piece, models.calendarPiece, 'order', 'ASC'],
            ],
        });
        console.log('Local events fetched from db.');
        const prunedEvents = events.map((cal) => {
            return {
                id: cal.id,
                summary: cal.name,
                location: cal.location,
                startDatetime: cal.dateTime,
                endDate: cal.endDate,
                allDay: cal.allDay,
                timeZone: cal.timezone,
                description: JSON.stringify({
                    collaborators: cal.collaborators?.map((collab) => {
                        return {
                            name: collab.name,
                            instrument: collab.instrument,
                        };
                    }),
                    pieces: cal.pieces?.map((piece) => {
                        return {
                            composer: piece.composer,
                            piece: piece.piece,
                        };
                    }),
                    type: cal.type,
                    website: cal.website,
                }),
            };
        });

        await Promise.each(prunedEvents, async (item) => {
            try {
                await getCalendarSingleEvent(db.sequelize, item.id);

                // if error not thrown, then event exists, update it
                await updateCalendar(db.sequelize, item);
                console.log(`updated: ${item.id}\n`);
                updated++;
            } catch (e) {
                const err = e as Error | AxiosError;
                if (axios.isAxiosError(err)) {
                    if (err.response?.status === 404) {
                        try {
                            await createCalendarEvent(db.sequelize, item);
                            console.log(`created: ${item.id}\n`);
                            created++;
                        } catch (ee) {
                            const eerr = ee as Error | AxiosError;
                            if (axios.isAxiosError(eerr)) {
                                console.log(`error: ${item.id}, ${eerr.response?.status} ${eerr.response?.statusText}\n`);
                                errored++;
                            } else {
                                throw ee;
                            }
                        }
                    } else {
                        console.log(`error: ${item.id}, ${err.response?.status} ${err.response?.statusText}\n`);
                        errored++;
                        throw (e);
                    }
                } else {
                    throw e;
                }
            }
        });
        const result = `
            updating finished.
            created: ${created}
            updated: ${updated}
            errored: ${errored}
        `;
        console.log(result);
        res.status(200).json({
            success: JSON.stringify([{
                created,
                updated,
                errored,
            }]),
        });
    } catch (error) {
        respondWithError(error, res);
    }
});

actionsRouter.post('/calendar/sync', async (_: express.Request, res: express.Response) => {
    let events: calendar[];
    const limit = 10;
    let offset = 0;

    let updated = 0;
    let created = 0;
    let errored = 0;

    try {
        do {
            console.log('Getting local events from db...\n');
            const models = db.models;
            events = await models.calendar.findAll({
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'calendarCollaborator', 'calendarPiece'],
                },
                include: [
                    {
                        model: models.collaborator,
                        attributes: {
                            exclude: ['id', 'createdAt', 'updatedAt', 'calendarCollaborator'],
                        },
                        through: {
                            attributes: ['order'],
                        },
                        include: [{
                            model: models.calendarCollaborator,
                            attributes: ['order'],
                        }],
                    },
                    {
                        model: models.piece,
                        attributes: {
                            exclude: ['id', 'createdAt', 'updatedAt', 'calendarPiece'],
                        },
                        through: {
                            attributes: ['order'],
                        },
                        include: [{
                            model: models.calendarPiece,
                            attributes: ['order'],
                        }],
                    },
                ],
                order: [
                    ['dateTime', 'DESC'],
                    [models.collaborator, models.calendarCollaborator, 'order', 'ASC'],
                    [models.piece, models.calendarPiece, 'order', 'ASC'],
                ],
                limit,
                offset,
            });
            offset += limit;
            console.log('Local events fetched from db.');
            const prunedEvents = events.map((cal) => {
                return {
                    id: cal.id,
                    summary: cal.name,
                    location: cal.location,
                    startDatetime: cal.dateTime,
                    endDate: cal.endDate,
                    allDay: cal.allDay,
                    timeZone: cal.timezone,
                    description: JSON.stringify({
                        collaborators: cal.collaborators?.map((collab) => {
                            return {
                                name: collab.name,
                                instrument: collab.instrument,
                            };
                        }),
                        pieces: cal.pieces?.map((piece) => {
                            return {
                                composer: piece.composer,
                                piece: piece.piece,
                            };
                        }),
                        type: cal.type,
                        website: cal.website,
                    }),
                };
            });

            await Promise.each(prunedEvents, async (item) => {
                try {
                    await getCalendarSingleEvent(db.sequelize, item.id);

                    // if error not thrown, then event exists, update it
                    await updateCalendar(db.sequelize, item);
                    console.log(`updated: ${item.id}\n`);
                    updated++;
                } catch (e) {
                    const err = e as Error | AxiosError;
                    if (axios.isAxiosError(err)) {
                        if (err.response?.status === 404) {
                            try {
                                await createCalendarEvent(db.sequelize, item);
                                console.log(`created: ${item.id}\n`);
                                created++;
                            } catch (ee) {
                                const eerr = ee as Error | AxiosError;
                                if (axios.isAxiosError(eerr)) {
                                    console.log(`error: ${item.id}, ${eerr.response?.status} ${eerr.response?.statusText}\n`);
                                    errored++;
                                } else {
                                    throw e;
                                }
                            }

                        } else {
                            console.log(`error: ${item.id}, ${err.response?.status} ${err.response?.statusText}\n`);
                            errored++;
                            throw (e);
                        }
                    } else {
                        throw e;
                    }
                }
            });

        } while (events.length !== 0);
        const result = `
            updating finished.
            created: ${created}
            updated: ${updated}
            errored: ${errored}
        `;
        console.log(result);
        res.status(200).json({
            success: JSON.stringify([{
                created,
                updated,
                errored,
            }]),
        });
    } catch (error) {
        respondWithError(error, res);
    }
});

// adminRest.post('/forest/actions/populate-test-data', forest.ensureAuthenticated, cors(corsOptions), async (_: express.Request, res: express.Response) => {
actionsRouter.post('/product/populate-test-data', async (_: express.Request, res: express.Response) => {
    const pricesAndProducts = await stripeClient.getPricesAndProducts();
    try {
        await db.sequelize.getQueryInterface().bulkInsert('product', pricesAndProducts.map((pp) => {
            try {
                const product = pp.product
                if (!stripeClient.productIsObject(product)) {
                    throw Error('Product expansion failed, or no product tied to Price.');
                }
                const {
                    id,
                    name,
                    description,
                    metadata,
                    images,
                } = product;
                return {
                    id,
                    name,
                    description,
                    price: pp.unit_amount,
                    pages: parseInt(metadata.pages),
                    file: metadata.file,
                    images,
                    type: metadata.type,
                    sample: metadata.sample,
                    price_id: pp.id,
                };
            } catch (e) {
                throw e;
            }
        }));
        res.sendStatus(200);
    } catch (e) {
        respondWithError(e, res);
    }
});

export const ActionsRouter = actionsRouter;
