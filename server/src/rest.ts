import * as Promise from 'bluebird';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as forest from 'forest-express-sequelize';
import * as path from 'path';
import * as Sequelize from 'sequelize';
import * as stripeClient from './stripe';

dotenv.config();

import {
    createCalendarEvent,
    getCalendarSingleEvent,
    updateCalendar } from './gapi/calendar';
import db from './models';
import { calendar } from './models/calendar';

const adminRest = express.Router();

adminRest.use(express.json());
adminRest.use(express.urlencoded({ extended: true }));

let allowedOrigins: Array<RegExp | string> = [/\.forestadmin\.com$/, /localhost:\d{4}$/];
if (process.env.CORS_ORIGINS) {
    allowedOrigins = allowedOrigins.concat(process.env.CORS_ORIGINS.split(','));
}

const corsOptions: cors.CorsOptions = {
    origin: allowedOrigins,
    allowedHeaders: ['Authorization', 'X-Requested-With', 'Content-Type'],
    optionsSuccessStatus: 204,
    maxAge: 86400,
    credentials: true,
};

adminRest.use('/forest/authentication', cors({
    ...corsOptions,
    origin: [...(corsOptions.origin as (string | RegExp)[]), 'null'],
}));

adminRest.use(cors(corsOptions));

const respondWithError = (error: any, res: express.Response) => {
    if (error instanceof Sequelize.ValidationError) {
        res.status(400).json({
            error: (error as Sequelize.ValidationError).errors.reduce((reduce, err) => {
                return reduce + err.message + ',';
            }, ''),
        });
    } else {
        res.status(400).json({
            error,
        });
    }
};

interface RequestWithBody extends express.Request {
    body: {
        data: {
            attributes: {
                ids: string[];
            };
        };
    };
}

adminRest.post('/forest/actions/sync-selected', forest.ensureAuthenticated, cors(corsOptions), async (req: RequestWithBody, res: express.Response) => {
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
                        model: models.CalendarPiece,
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
                    collaborators: cal.collaborators.map((collab) => {
                        return {
                            name: collab.name,
                            instrument: collab.instrument,
                        };
                    }),
                    pieces: cal.pieces.map((piece) => {
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
                if (e.response.status === 404) {
                    try {
                        await createCalendarEvent(db.sequelize, item);
                        console.log(`created: ${item.id}\n`);
                        created++;
                    } catch (e) {
                        console.log(`error: ${item.id}, ${e.response.status} ${e.response.statusText}\n`);
                        errored++;
                    }
                } else {
                    console.log(`error: ${item.id}, ${e.response.status} ${e.response.statusText}\n`);
                    errored++;
                    throw (e);
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

adminRest.post('/forest/actions/sync', forest.ensureAuthenticated, cors(corsOptions), async (_: express.Request, res: express.Response) => {
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
                        collaborators: cal.collaborators.map((collab) => {
                            return {
                                name: collab.name,
                                instrument: collab.instrument,
                            };
                        }),
                        pieces: cal.pieces.map((piece) => {
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
                    if (e.response.status === 404) {
                        try {
                            await createCalendarEvent(db.sequelize, item);
                            console.log(`created: ${item.id}\n`);
                            created++;
                        } catch (e) {
                            console.log(`error: ${item.id}, ${e.response.status} ${e.response.statusText}\n`);
                            errored++;
                        }
                    } else {
                        console.log(`error: ${item.id}, ${e.response.status} ${e.response.statusText}\n`);
                        errored++;
                        throw (e);
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

adminRest.post('/forest/actions/populate-test-data', forest.ensureAuthenticated, cors(corsOptions), async (_: express.Request, res: express.Response) => {
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
                console.log(e);
            }
        }), {

        });
        res.sendStatus(200);
    } catch (e) {
        respondWithError(e, res);
    }
});

const addForest = async () => {
    adminRest.use(await forest.init({
        // modelsDir: path.join(__dirname, './models'), // Your models directory.
        configDir: path.join(__dirname, './forest'),
        envSecret: process.env.FOREST_ENV_SECRET,
        authSecret: process.env.FOREST_AUTH_SECRET,
        // sequelize: db.sequelize,
        objectMapping: db.objectMapping,
        connections: db.connections,
    }));
};

addForest();

export const AdminRest = adminRest;
