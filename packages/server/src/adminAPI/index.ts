import * as dotenv from 'dotenv';
import * as express from 'express';
import * as stripeClient from '../stripe.js';

dotenv.config({ override: true });

import {
    EntityData,
    FilterQuery,
    Loaded,
    ValidationError,
    wrap,
} from '@mikro-orm/core';
import { csrfMiddleware } from '../csrf.js';
import orm from '../database.js';
import { getImageFromMetaTag } from '../gapi/calendar.js';
import { getPhotos } from '../gapi/places.js';
import { Acclaim } from '../models/Acclaim.js';
import { Bio } from '../models/Bio.js';
import { Calendar } from '../models/Calendar.js';
import { CalendarCollaborator } from '../models/CalendarCollaborator.js';
import { CalendarPiece } from '../models/CalendarPiece.js';
import { Collaborator } from '../models/Collaborator.js';
import { Disc } from '../models/Disc.js';
import { DiscLink } from '../models/DiscLink.js';
import { Faq } from '../models/Faq.js';
import { Music } from '../models/Music.js';
import { MusicFile } from '../models/MusicFile.js';
import { Photo } from '../models/Photo.js';
import { Piece } from '../models/Piece.js';
import { Product, ProductTypes } from '../models/Product.js';
import { User } from '../models/User.js';
import { crud, setGetListHeaders } from './crud.js';
import { mikroCrud } from './mikroCrud.js';
import { NotFoundError } from './types.js';

const adminRest = express.Router();
adminRest.use(express.json());
adminRest.use(express.urlencoded({ extended: true }));
adminRest.post('*', csrfMiddleware);

export const respondWithError = (error: Error, res: express.Response): void => {
    console.error(error);
    if (error instanceof ValidationError) {
        res.status(400).json({
            error: (error as ValidationError).message,
        });
    } else {
        res.status(400).json({
            error,
        });
    }
};

export interface RequestWithBody extends express.Request {
    body: {
        data: {
            attributes: {
                ids: string[];
            };
        };
    };
}

adminRest.use(crud('/bios', mikroCrud({ entity: Bio })));

adminRest.use(crud('/acclaims', mikroCrud({ entity: Acclaim })));
adminRest.use(
    crud('/calendars', {
        ...mikroCrud({ entity: Calendar }),
        getOne: async (id) => {
            const cal = await orm.em.findOneOrFail(
                Calendar,
                { id },
                {
                    populate: [
                        'collaborators',
                        'collaborators.calendarCollaborators',
                        'pieces',
                        'pieces.calendarPieces',
                    ],
                },
            );
            const plainCal = wrap(cal).toPOJO();
            return {
                ...plainCal,
                collaborators: plainCal.collaborators.map((val) => {
                    return {
                        ...val,
                        order: val.calendarCollaborators[0].order,
                    };
                }),
                pieces: plainCal.pieces.map((val) => {
                    return { ...val, order: val.calendarPieces[0].order };
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
                    'collaborators.calendarCollaborators',
                    'pieces',
                    'pieces.calendarPieces',
                ],
            });

            return {
                count: cals[1],
                rows: cals[0].map((cal) => {
                    const pojo = wrap(cal).toPOJO();
                    return {
                        ...pojo,
                        // dateTime: transformDateTime(cal.dateTime, cal.timezone),
                        collaborators: pojo.collaborators.map((val) => {
                            return {
                                ...val,
                                order: val.calendarCollaborators[0].order,
                            };
                        }),
                        pieces: pojo.pieces.map((val) => {
                            return {
                                ...val,
                                order: val.calendarPieces[0].order,
                            };
                        }),
                    };
                }),
            };
        },
        search: async ({ q, limit }, _) => {
            const tokens = q.trim().replaceAll(', ', '|').replaceAll(' ', '&');
            const calendarResults = await orm.em.findAndCount(
                Calendar,
                {
                    calendarSearchMatview: {
                        Search: {
                            $fulltext: tokens,
                        },
                    },
                },
                {
                    populate: [
                        'collaborators',
                        'collaborators.calendarCollaborators',
                        'pieces',
                        'pieces.calendarPieces',
                    ],
                    orderBy: [{ dateTime: 'DESC' }],
                    limit,
                },
            );
            return {
                count: calendarResults[1],
                rows: calendarResults[0].map((cal) => {
                    const pojo = wrap(cal).toPOJO();
                    return {
                        ...pojo,
                        // dateTime: transformDateTime(cal.dateTime, cal.timezone),
                        collaborators: pojo.collaborators.map((val) => {
                            return {
                                ...val,
                                order: val.calendarCollaborators[0].order,
                            };
                        }),
                        pieces: pojo.pieces.map((val) => {
                            return {
                                ...val,
                                order: val.calendarPieces[0].order,
                            };
                        }),
                    };
                }),
            };
        },
    }),
);

adminRest.use(
    crud('/pieces', {
        ...mikroCrud({ entity: Piece, populate: ['calendars'] }),
        search: async ({ q, limit }) => {
            const tokens = q.trim().replaceAll(', ', '|').replaceAll(' ', '&');
            const [rows, count] = await orm.em.findAndCount(
                Piece,
                { Search: { $fulltext: tokens } },
                {
                    populate: ['calendars'],
                    limit,
                },
            );
            return {
                count,
                rows,
            };
        },
    }),
);

adminRest.use(
    crud('/collaborators', {
        ...mikroCrud({ entity: Collaborator, populate: ['calendars'] }),
        search: async ({ q, limit }) => {
            const tokens = q.trim().replaceAll(', ', '|').replaceAll(' ', '&');
            const results = await orm.em.findAndCount(
                Collaborator,
                { Search: { $fulltext: tokens } },
                {
                    populate: ['calendars'],
                    limit,
                },
            );
            return {
                count: results[1],
                rows: results[0],
            };
        },
    }),
);

interface CalendarPieceCreate extends EntityData<CalendarPiece> {
    ref?: string;
    composer: string;
    piece: string;
    order: number;
    calendarId: string;
}

interface CalendarCollaboratorCreate extends EntityData<CalendarCollaborator> {
    ref?: string;
    name: string;
    instrument: string;
    order: number;
    calendarId: string;
}

adminRest.use(
    crud('/calendar-collaborators', {
        ...mikroCrud({ entity: CalendarCollaborator }),
        create: async (body) => {
            console.log(body);
            const createBody = body as CalendarCollaboratorCreate;
            const cal = await orm.em.findOneOrFail(Calendar, {
                id: createBody.calendarId,
            });
            const collab =
                createBody.id ??
                orm.em.create(Collaborator, {
                    name: createBody.name,
                    instrument: createBody.instrument,
                });

            const calCollab = orm.em.create(CalendarCollaborator, {
                calendar: cal,
                collaborator: collab,
                order: createBody.order,
            });

            if (typeof collab !== 'string') {
                orm.em.persist(collab);
            }
            orm.em.persist(calCollab);
            await orm.em.flush();

            return {
                ...calCollab,
                id: cal.id,
            };
        },
        update: async (id, body) => {
            const record = await orm.em.findOneOrFail(
                CalendarCollaborator,
                { id },
                { failHandler: () => new NotFoundError() },
            );
            if (!!body.name || !!body.instrument) {
                const collab = await orm.em.findOneOrFail(Collaborator, {
                    id: body.collaboratorId,
                });
                collab.instrument = body.instrument;
                collab.name = body.name;
            }
            if (body.order !== null) {
                record.order = body.order;
            }
            await orm.em.flush();
            return record;
        },
        destroy: async (id) => {
            const calCollab = await orm.em.findOneOrFail(CalendarCollaborator, {
                id,
            });
            orm.em.remove(calCollab);
            await orm.em.flush();
            return { id };
        },
    }),
);

adminRest.use(
    crud('/calendar-pieces', {
        ...mikroCrud({ entity: CalendarPiece }),
        create: async (body) => {
            const createBody = body as CalendarPieceCreate;
            const cal = await orm.em.findOneOrFail(Calendar, {
                id: createBody.calendarId,
            });
            const piece =
                createBody.id ??
                orm.em.create(Piece, {
                    piece: createBody.piece,
                    composer: createBody.composer,
                });

            const calPiece = orm.em.create(CalendarPiece, {
                calendar: cal,
                piece,
                order: createBody.order,
            });

            if (typeof piece !== 'string') {
                orm.em.persist(piece);
            }
            orm.em.persist(calPiece);
            await orm.em.flush();

            return {
                ...calPiece,
                id: cal.id,
            };
        },
        update: async (id, body) => {
            const record = await orm.em.findOneOrFail(
                CalendarPiece,
                { id },
                { failHandler: () => new NotFoundError() },
            );
            if (!!body.composer || !!body.piece) {
                const piece = await orm.em.findOneOrFail(Piece, {
                    id: body.pieceId,
                });
                piece.piece = body.pieceName;
                piece.composer = body.composer;
            }
            if (body.order !== null) {
                record.order = body.order;
            }
            await orm.em.flush();
            return record;
        },
        destroy: async (id) => {
            const calPiece = await orm.em.findOneOrFail(CalendarPiece, { id });
            orm.em.remove(calPiece);
            await orm.em.flush();
            return { id };
        },
    }),
);

adminRest.use(
    crud(
        '/musics',
        mikroCrud({
            entity: Music,
            populate: ['musicFiles'],
            searchableFields: ['composer', 'piece', 'contributors', 'type'],
        }),
    ),
);

adminRest.use(
    crud(
        '/music-files',
        mikroCrud({
            entity: MusicFile,
            searchableFields: ['audioFile', 'name', 'waveformFile'],
        }),
    ),
);

adminRest.use(
    crud(
        '/discs',
        mikroCrud({
            entity: Disc,
            populate: ['discLinks'],
            searchableFields: ['title', 'description'],
        }),
    ),
);

adminRest.use(crud('/disc-links', mikroCrud({ entity: DiscLink })));
adminRest.use(crud('/photos', mikroCrud({ entity: Photo })));
adminRest.use(
    crud('/users', mikroCrud({ entity: User, populate: ['products'] })),
);
adminRest.use(crud('/products', mikroCrud({ entity: Product })));
adminRest.use(crud('/faqs', mikroCrud({ entity: Faq })));

adminRest.post(
    '/actions/products/pull-from-stripe',
    async (_: express.Request, res: express.Response) => {
        try {
            const pricesAndProducts = await stripeClient.getPricesAndProducts();
            const data = pricesAndProducts.map((prod) => {
                if (!stripeClient.productIsObject(prod)) {
                    throw Error(
                        'Product expansion failed, or no product tied to Price.',
                    );
                }
                const {
                    id,
                    name,
                    description,
                    metadata: { type, sample, pages, permalink, file },
                    images,
                    default_price,
                } = prod;
                if (typeof default_price === 'string' || !default_price) {
                    throw Error('default_price not expanded');
                }

                return {
                    id,
                    name,
                    description: description ?? '',
                    price: default_price.unit_amount ?? 0,
                    pages: parseInt(pages),
                    file: file ?? '',
                    images:
                        images.length !== 0
                            ? images.map((v) =>
                                  v.replace(stripeClient.THUMBNAIL_STATIC, ''),
                              )
                            : undefined,
                    type: type as typeof ProductTypes[number],
                    sample,
                    priceId: default_price.id ?? '',
                    permalink: permalink ?? '',
                };
            });
            const products = await orm.em.upsertMany(Product, data);
            const count = await orm.em.count(Product, {});

            setGetListHeaders(res, count, products.length);
            res.status(201).json(products);
        } catch (e) {
            respondWithError(e as Error, res);
        }
    },
);

const populateImages = async (entity: Calendar) => {
    try {
        const { website, imageUrl, location } = entity;

        if (website) {
            if (imageUrl === null) {
                const fetchedImageUrl = await getImageFromMetaTag(website);
                entity.imageUrl = fetchedImageUrl;
                entity.usePlacePhoto = fetchedImageUrl === '';
            } else {
                entity.usePlacePhoto = imageUrl === '';
            }
        }

        if (location) {
            try {
                const otherCal = await orm.em.findOne(Calendar, {
                    $and: [{ location }, { photoReference: { $ne: null } }],
                });
                if (otherCal) {
                    entity.photoReference = otherCal.photoReference;
                    entity.placeId = otherCal.placeId;
                } else {
                    const { photoReference, placeId } = await getPhotos(
                        location,
                    );
                    entity.photoReference = photoReference;
                    entity.placeId = placeId;
                }
            } catch (e) {
                console.log(`[Hook: BeforeCreate] ${e}`);
                entity.photoReference = '';
                entity.placeId = '';
            }
        }
    } catch (e) {
        console.log(e);
    }
};

adminRest.post(
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

export const AdminRest = adminRest;
