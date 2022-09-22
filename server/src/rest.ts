import * as dotenv from 'dotenv';
import * as express from 'express';
import { Attributes, FindOptions, fn, literal, Model, ModelStatic, Op, Order, UUID, ValidationError, where, WhereOptions } from 'sequelize';
import crud from 'express-crud-router';
import * as stripeClient from './stripe';
import { ProductCreationAttributes, ProductTypes } from './models/product';
import * as Promise from 'bluebird';

dotenv.config();

import db from './models';

const models = db.models;

import { calendar, CalendarAttributes, getImageFromMetaTag } from './models/calendar';
import { ActionsRouter } from './actions';
import { flatten, isObject, transform, uniqBy } from 'lodash';
import { collaborator, CollaboratorAttributes } from './models/collaborator';
import { piece, PieceAttributes } from './models/piece';
import { CalendarPieceAttributes } from './models/calendarPiece';
import { CalendarCollaboratorAttributes } from './models/calendarCollaborator';
import { Actions } from './types';
import { getPhotos } from './gapi/places';

const adminRest = express.Router();

adminRest.use(express.json());
adminRest.use(express.urlencoded({ extended: true }));

export const respondWithError = (error: any, res: express.Response): void => {
    console.error(error);
    if (error instanceof ValidationError) {
        res.status(400).json({
            error: (error as ValidationError).errors.reduce((reduce, err) => {
                return reduce + err.message + ',';
            }, ''),
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

adminRest.use('/\/actions/', ActionsRouter);

const replaceKeysDeep = (obj: { [k: string]: any }, keysMap: { [k: string]: string }) => { // keysMap = { oldKey1: newKey1, oldKey2: newKey2, etc...
    return transform(obj, (result: { [k: string]: any }, value, key) => { // transform to a new object

        const currentKey = keysMap[key] || key; // if the key is in keysMap use the replacement, if not use the original key

        result[currentKey] = isObject(value) ? replaceKeysDeep(value, keysMap) : value; // if the key is an object run it through the inner function - replaceKeys
    });
};

const EXCLUDE_TIMESTAMPS = ['created_at', 'updated_at', 'createdAt', 'updatedAt'];

const sequelizeCrud = <I extends string | number, M extends Model, R extends Attributes<M>>(
    model: ModelStatic<M>,
): Omit<Actions<I, R>, 'search'> => {
    return {
        create: async body =>
            (await model.create(body)).get(), // get for type happiness, don't need for js
        update: async (id, body) => {
            const record = await model.findByPk(id, {
                attributes: {
                    exclude: EXCLUDE_TIMESTAMPS,
                },
            });
            if (!record) {
                throw new Error('Record not found');
            }
            return record.update(body)
        },
        updateMany: async (ids, body) => {
            const records = await model.update(body,
                {
                    where: {
                        id: ids as any
                    },
                    returning: true,
                },
            );
            return {
                count: records[0],
                rows: records[1],
            };
        },
        getOne: async id => {
            const m = await model.findByPk(id, {
                attributes: {
                    exclude: EXCLUDE_TIMESTAMPS,
                },
            });
            if (m === null) {
                throw new Error('record not found');
            }
            return m.get();
        },
        getList: async ({ filter, limit, offset, order }) => {
            order = Array.isArray(order[0][0]) ? order[0] as any : order;
            const result = await model.findAndCountAll({
                attributes: {
                    exclude: EXCLUDE_TIMESTAMPS,
                },
                limit,
                offset,
                order,
                where: filter
            });
            return {
                count: result.count,
                rows: result.rows.map((row) => row.get()),
            };
        },
        destroy: async id => {
            const record = await model.findByPk(id)
            if (!record) {
                throw new Error('Record not found')
            }
            await record.destroy()
            return { id }
        },
    }
}

const sequelizeSearchFields =
    <M extends Model, R extends M['_attributes']>(
        model: ModelStatic<M>,
        searchableFields: (keyof R)[],
        comparator: symbol = Op.iLike
    ) =>
        async (q: string, limit: number, scope: WhereOptions<R> = {}) => {
            const resultChunks = await Promise.all(
                prepareQueries<R>(model, searchableFields)(q, comparator).map(
                    query =>
                        model.findAll({
                            limit,
                            where: { ...query!, ...scope },
                            raw: true,
                        })
                )
            )

            const rows = uniqBy(flatten(resultChunks).slice(0, limit), 'id')

            return { rows, count: rows.length }
        }

const getSearchTerm = <Attributes>(
    model: ModelStatic<Model<Attributes>>,
    field: keyof Attributes,
    comparator: symbol,
    token: string
) => {
    if (
        String(model.rawAttributes[field as string].type) === String(UUID)
    ) {
        return { [Op.eq]: token }
    }
    return { [comparator]: `%${token}%` }
}

const prepareQueries =
    <Attributes>(
        model: ModelStatic<Model<Attributes>>,
        searchableFields: (keyof Attributes)[]
    ) =>
        (q: string, comparator: symbol = Op.iLike): WhereOptions<Attributes>[] => {
            if (!searchableFields) {
                // TODO: we could propose a default behavior based on model rawAttributes
                // or (maybe better) based on existing indexes. This can be complexe
                // because we have to deal with column types
                throw new Error(
                    'You must provide searchableFields option to use the "q" filter in express-sequelize-crud'
                )
            }

            const defaultQuery = {
                [Op.or]: searchableFields.map(field => ({
                    [field]: getSearchTerm(model, field, comparator, q),
                })),
            }

            const tokens = q.split(/\s+/).filter(token => token !== '')
            if (tokens.length < 2) return [defaultQuery]

            // query consists of multiple tokens => do multiple searches
            return [
                // priority to unsplit match
                defaultQuery,

                // then search records with all tokens
                {
                    [Op.and]: tokens.map(token => ({
                        [Op.or]: searchableFields.map(field => ({
                            [field]: getSearchTerm(model, field, comparator, token),
                        })),
                    })),
                },

                // then search records with at least one token
                {
                    [Op.or]: tokens.map(token => ({
                        [Op.or]: searchableFields.map(field => ({
                            [field]: getSearchTerm(model, field, comparator, token),
                        })),
                    })),
                },
            ]
        }

adminRest.use(crud('/bios', {
    ...sequelizeCrud(models.bio),
    getList: async ({ filter, limit, offset, order }) => {
        order = Array.isArray(order[0][0]) ? order[0] as any : order;
        const transformedOrder: Order = order.map(([field, dir]) => {
            if (field === 'id') {
                return ['paragraph', dir];
            } else {
                return [field, dir];
            }
        });
        const transformedFilter: Record<string, any> = replaceKeysDeep(filter, { id: 'paragraph', ids: '' })
        return models.bio.findAndCountAll({ limit, offset, order: transformedOrder, where: transformedFilter });
    },
    create: async (body) => {
        const bio = await models.bio.create(body, { raw: true });
        return {
            ...bio.get({ plain: true }),
            id: bio.paragraph,
        };
    }
}));

const calendarIncludeBase = [
    {
        model: models.collaborator,
        attributes: {
            exclude: [...EXCLUDE_TIMESTAMPS, '_search'],
        },
        through: {
            attributes: ['order', 'id'],
        },
    },
    {
        model: models.piece,
        attributes: {
            exclude: [...EXCLUDE_TIMESTAMPS, '_search'],
        },
        through: {
            attributes: ['order', 'id'],
        },
    },
];

interface CollaboratorWithOrder extends CollaboratorAttributes {
    order?: number;
    through?: string;
}

interface PieceWithOrder extends PieceAttributes {
    order?: number;
    through?: string;
}

const pieceReducer = (acc: PieceWithOrder[], val: piece) => {
    const {
        calendarPiece,
    } = val;
    const rest = val.get({ plain: true });
    if (calendarPiece === undefined) {
        return acc;
    }
    if (calendarPiece.order === undefined) {
        acc.push({
            ...rest,
            through: calendarPiece.id,
        });
    } else {
        acc[calendarPiece.order] = {
            ...rest,
            order: calendarPiece.order,
            through: calendarPiece.id,
        };
    }
    return acc;
};

const collaboratorReducer = (acc: CollaboratorWithOrder[], val: collaborator) => {
    const {
        calendarCollaborator,
    } = val;
    const rest = val.get({ plain: true });
    if (calendarCollaborator === undefined) {
        return acc;
    }
    if (calendarCollaborator.order === undefined) {
        acc.push({
            ...rest,
            through: calendarCollaborator.id,
        });
    } else {
        acc[calendarCollaborator.order] = {
            ...rest,
            order: calendarCollaborator.order,
            through: calendarCollaborator.id,
        };
    }
    return acc;
};

adminRest.use(crud('/acclaims', sequelizeCrud(models.acclaim)));
adminRest.use(crud('/calendars', {
    ...sequelizeCrud(models.calendar),
    getOne: async id => {
        const cal = await models.calendar.findByPk(id, {
            attributes: {
                exclude: EXCLUDE_TIMESTAMPS,
            },
            include: calendarIncludeBase,
        });
        if (cal === null) {
            throw new Error('record not found');
        }
        return {
            ...cal.get({ plain: true }),
            // dateTime: transformDateTime(cal.dateTime, cal.timezone),
            collaborators: cal.collaborators?.reduce(collaboratorReducer, []).filter(v => v !== null),
            pieces: cal.pieces?.reduce(pieceReducer, []).filter(v => v !== null),
        };
    },
    getList: async ({ filter, limit, offset, order }) => {
        order = Array.isArray(order[0][0]) ? order[0] as any : order;
        const cals = await models.calendar.findAndCountAll({
            attributes: {
                exclude: EXCLUDE_TIMESTAMPS,
            },
            include: calendarIncludeBase,
            limit,
            offset,
            order,
            where: filter,
            distinct: true,
        });
        return {
            count: cals.count,
            rows: cals.rows.map((cal) => {
                return {
                    ...cal.get({ plain: true }),
                    // dateTime: transformDateTime(cal.dateTime, cal.timezone),
                    collaborators: cal.collaborators?.reduce(collaboratorReducer, []).filter(v => v !== null),
                    pieces: cal.pieces?.reduce(pieceReducer, []).filter(v => v !== null),
                };
            }),
        }
    },
    search: async (q: string, limit: number, _: Record<string, any>) => {
        const tokens = q.replaceAll(', ', '|').replaceAll(' ', '&');
        const splitTokens = tokens.split('|').map(t => t.split('&'));
        const calendarResults = await db.models.calendar.findAndCountAll({
            where: {
                [Op.or]: [
                    where(
                        calendar.rawAttributes.id,
                        Op.in,
                        literal(`(SELECT cs.id from calendar_search('${tokens}') cs)`)),
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
                                    ]
                                };
                            }),
                        };
                    }),
                ],
            },
            attributes: {
                exclude: EXCLUDE_TIMESTAMPS,
            },
            include: calendarIncludeBase,
            limit,
            order: [
                ['dateTime', 'DESC'],
                [models.collaborator, models.calendarCollaborator, 'order', 'ASC'],
                [models.piece, models.calendarPiece, 'order', 'ASC'],
            ],
            distinct: true,
        });
        return {
            count: calendarResults.count,
            rows: calendarResults.rows.map((cal) => {
                return {
                    ...cal.get({ plain: true }),
                    // dateTime: transformDateTime(cal.dateTime, cal.timezone),
                    collaborators: cal.collaborators?.reduce(collaboratorReducer, []).filter(v => v !== null),
                    pieces: cal.pieces?.reduce(pieceReducer, []).filter(v => v !== null),
                };
            }),
        };
    }
}));

adminRest.use(crud('/pieces', {
    ...sequelizeCrud(models.piece),
    getOne: async (id) => models.piece.findByPk(id, {
        attributes: {
            exclude: [...EXCLUDE_TIMESTAMPS, '_search'],
        },
        include: [{
            model: models.calendar,
            through: {
                attributes: ['order', 'id'],
            },
        }],
        order: [
            [models.calendar, 'dateTime', 'DESC'],
        ],
    }),
    getList: async ({ filter, limit, offset, order }) => {
        order = Array.isArray(order[0][0]) ? order[0] as any : order;
        const piecesResult = await db.models.piece.findAndCountAll({
            attributes: {
                exclude: [...EXCLUDE_TIMESTAMPS, '_search'],
            },
            include: [{
                model: models.calendar,
                through: {
                    attributes: ['order', 'id'],
                },
            }],
            limit,
            offset,
            order: [
                ...order,
                [models.calendar, 'dateTime', 'DESC'],
            ],
            where: filter,
            distinct: true,
        });
        return piecesResult;
    },
    search: async (q: string, limit: number, _: Record<string, any>) => {
        const tokens = q.replaceAll(', ', '|').replaceAll(' ', '&');
        const splitTokens = tokens.split('|').map(t => t.split('&'));
        const results = await db.models.piece.findAndCountAll({
            where: {
                [Op.or]: [
                    {
                        _search: {
                            [Op.match]: fn('to_tsquery', 'en', tokens),
                        },
                    },
                    ...splitTokens.map(t => {
                        return {
                            [Op.and]: t.map(v => {
                                return {
                                    [Op.or]: [
                                        {
                                            composer: {
                                                [Op.iLike]: `%${v}%`,
                                            }
                                        },
                                        {
                                            piece: {
                                                [Op.iLike]: `%${v}%`,

                                            }
                                        },
                                    ]
                                };
                            }),
                        };
                    }),
                ]
            },
            attributes: {
                exclude: EXCLUDE_TIMESTAMPS,
            },
            include: [{
                model: models.calendar,
                through: {
                    attributes: ['order', 'id'],
                },
            }],
            limit,
            order: [
                [models.calendar, 'dateTime', 'DESC'],
            ],
            distinct: true
        });
        return results;
    },
}));

adminRest.use(crud('/collaborators', {
    ...sequelizeCrud(models.collaborator),
    getOne: async (id) => models.collaborator.findByPk(id, {
        attributes: {
            exclude: [...EXCLUDE_TIMESTAMPS, '_search'],
        },
        include: [{
            model: models.calendar,
            through: {
                attributes: ['order', 'id'],
            },
        }],
        order: [
            [models.calendar, 'dateTime', 'DESC'],
        ],
    }),
    getList: async ({ filter, limit, offset, order }) => {
        order = Array.isArray(order[0][0]) ? order[0] as any : order;
        const collaboratorsResult = await db.models.collaborator.findAndCountAll({
            attributes: {
                exclude: [...EXCLUDE_TIMESTAMPS, '_search'],
            },
            include: [{
                model: models.calendar,
                through: {
                    attributes: ['order', 'id'],
                },
            }],
            limit,
            offset,
            order: [
                ...order,
                [models.calendar, 'dateTime', 'DESC'],
            ],
            where: filter,
            distinct: true,
        });
        return collaboratorsResult;
    },
    search: async (q: string, limit: number, _: Record<string, any>) => {
        const tokens = q.replaceAll(', ', '|').replaceAll(' ', '&');
        const splitTokens = tokens.split('|').map(t => t.split('&'));
        const results = await db.models.collaborator.findAndCountAll({
            where: {
                [Op.or]: [
                    {
                        _search: {
                            [Op.match]: fn('to_tsquery', 'en', tokens),
                        },
                    },
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
                                            instrument: {
                                                [Op.iLike]: `%${v}%`,

                                            }
                                        },
                                    ]
                                };
                            }),
                        };
                    }),
                ]
            },
            attributes: {
                exclude: EXCLUDE_TIMESTAMPS,
            },
            include: [{
                model: models.calendar,
                through: {
                    attributes: ['order', 'id'],
                },
            }],
            limit,
            order: [
                [models.calendar, 'dateTime', 'DESC'],
            ],
            distinct: true
        });
        return results;
    },
}));

interface CalendarPieceCreate extends CalendarPieceAttributes {
    id: string;
    ref?: string;
    composer: string;
    piece: string;
}

interface CalendarCollaboratorCreate extends CalendarCollaboratorAttributes {
    id: string;
    ref?: string;
    name: string;
    order: number;
    instrument: string;
}

adminRest.use(crud('/calendar-collaborators', {
    ...sequelizeCrud(models.calendarCollaborator),
    create: async (body: CalendarCollaboratorAttributes) => {
        const cal = await db.models.calendar.findByPk(body.id);
        if (cal === null) {
            throw new Error('record not found');
        }
        const extendedBody = (body as CalendarCollaboratorCreate);
        const newCollaborator = extendedBody.ref || await db.models.collaborator.create({
            name: extendedBody.name,
            instrument: extendedBody.instrument,
        });

        cal.addCollaborator(newCollaborator, { through: { order: body.order } });

        return {
            ...cal.get(),
            id: cal.id,
        };
    },
    destroy: async (id: string) => {
        const calPiece = await db.models.calendarCollaborator.findByPk(id);
        if (calPiece === null) {
            throw new Error('record not found');
        }
        const cal = await db.models.calendar.findByPk(calPiece.calendarId);
        if (cal === null) {
            throw new Error('record not found');
        }
        cal.removeCollaborator(calPiece.collaboratorId);
        return { id };
    },
}));

adminRest.use(crud('/calendar-pieces', {
    ...sequelizeCrud(models.calendarPiece),
    create: async (body: CalendarPieceAttributes) => {
        const cal = await db.models.calendar.findByPk(body.id);
        if (cal === null) {
            throw new Error('record not found');
        }
        const extendedBody = (body as CalendarPieceCreate);
        const newPiece = extendedBody.ref || await db.models.piece.create({
            composer: extendedBody.composer,
            piece: extendedBody.piece,
        });

        cal.addPiece(newPiece, { through: { order: body.order } });

        return {
            ...cal.get(),
            id: cal.id,
        };
    },
    destroy: async (id: string) => {
        const calPiece = await db.models.calendarPiece.findByPk(id);
        if (calPiece === null) {
            throw new Error('record not found');
        }
        const cal = await db.models.calendar.findByPk(calPiece.calendarId);
        if (cal === null) {
            throw new Error('record not found');
        }
        cal.removePiece(calPiece.pieceId);
        return { id };
    },
}));

adminRest.use(crud('/musics', {
    ...sequelizeCrud(models.music),
    getOne: async id => models.music.findByPk(id, {
        include: [{
            model: models.musicFile,
            attributes: {
                exclude: EXCLUDE_TIMESTAMPS,
            },
            order: [
                [models.musicFile, 'name', 'ASC']
            ],
        }],
    }),
    getList: async ({ filter, limit, offset, order }) => {
        order = Array.isArray(order[0][0]) ? order[0] as any : order;
        return models.music.findAndCountAll({
            attributes: {
                exclude: EXCLUDE_TIMESTAMPS,
            },
            include: [{
                model: models.musicFile,
                attributes: {
                    exclude: EXCLUDE_TIMESTAMPS,
                },
            }],
            limit,
            offset,
            order: [
                ...order,
                [models.musicFile, 'name', 'ASC'],
            ],
            where: filter,
            distinct: true,
        });
    },
    search: sequelizeSearchFields(models.music, ['composer', 'piece', 'contributors', 'type'])
}));


adminRest.use(crud('/music-files', sequelizeCrud(models.musicFile)));
adminRest.use(crud('/discs', {
    ...sequelizeCrud(models.disc),
    getOne: async id => models.disc.findByPk(id, {
        include: [{
            model: models.discLink,
            attributes: {
                exclude: EXCLUDE_TIMESTAMPS,
            },
        }],
    }),
    getList: async ({ filter, limit, offset, order }) => {
        order = Array.isArray(order[0][0]) ? order[0] as any : order;
        return models.disc.findAndCountAll({
            attributes: {
                exclude: EXCLUDE_TIMESTAMPS,
            },
            include: [{
                model: models.discLink,
                attributes: {
                    exclude: EXCLUDE_TIMESTAMPS,
                },
            }],
            limit,
            offset,
            order,
            where: filter,
            distinct: true,
        });
    },
    search: sequelizeSearchFields(models.disc, ['title', 'description'])
}));
adminRest.use(crud('/disc-links', sequelizeCrud(models.discLink)));
adminRest.use(crud('/photos', sequelizeCrud(models.photo)));
adminRest.use(crud('/customers', {
    ...sequelizeCrud(models.user),
    getOne: async id => models.user.findByPk(id, {
        include: [{
            model: models.product,
            through: {
                attributes: ['id'],
            },
            attributes: {
                exclude: EXCLUDE_TIMESTAMPS,
            }
        }]
    }),
    getList: async ({ filter, limit, offset, order }) => {
        order = Array.isArray(order[0][0]) ? order[0] as any : order;
        return models.user.findAndCountAll({
            attributes: {
                exclude: EXCLUDE_TIMESTAMPS,
            },
            include: [{
                model: models.product,
                through: {
                    attributes: ['id'],
                },
                attributes: {
                    exclude: EXCLUDE_TIMESTAMPS,
                },
            }],
            limit,
            offset,
            order,
            where: filter,
            distinct: true,
        });
    },
}));
adminRest.use(crud('/products', sequelizeCrud(models.product)));
adminRest.use(crud('/faqs', sequelizeCrud(models.faq)));

adminRest.post('/actions/products/pull-from-stripe', async (_: express.Request, res: express.Response) => {
    try {
        const pricesAndProducts = await stripeClient.getPricesAndProducts();
        const prods = await db.models.product.bulkCreate(pricesAndProducts.map((prod): ProductCreationAttributes => {
            try {
                const product = prod;
                if (!stripeClient.productIsObject(product)) {
                    throw Error('Product expansion failed, or no product tied to Price.');
                }
                const {
                    id,
                    name,
                    description,
                    metadata: {
                        type, sample, pages, permalink, file
                    },
                    images,
                    default_price,
                } = product;
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
                    images: (images.length !== 0) ? images.map((v) => v.replace(stripeClient.THUMBNAIL_STATIC, '')) : undefined,
                    type: type as typeof ProductTypes[number],
                    sample,
                    priceID: default_price.id ?? '',
                    permalink: permalink ?? '',
                };
            } catch (e) {
                throw e;
            }
        }), {
            hooks: false,
            individualHooks: false,
            updateOnDuplicate: [
                'file', 'name', 'permalink', 'description', 'sample', 'images', 'price', 'priceID', 'type',
            ],
        });
        const reProds = await db.models.product.findAndCountAll({
            where: {
                id: prods.map((p) => p.id)
            },
        })
        res
            .header('x-total-count', reProds.count.toFixed(0))
            .status(200)
            .json(reProds.rows);
    } catch (e) {
        respondWithError(e, res);
    }
});

const calendarMapFn = async (cal: calendar, idx: number) => {
    console.log(`[POPULATING ${idx}]`);
    try {
        console.log(cal.imageUrl, cal.website);
        if (cal.website && cal.imageUrl === null) {
            const imageUrl = await getImageFromMetaTag(cal.website);
            console.log(imageUrl);
            cal.set('imageUrl', imageUrl);
        }
        console.log(cal.photoReference);
        if (cal.location && cal.photoReference === null) {
            const { photoReference, placeId } = await getPhotos(cal.location);
            cal.set('photoReference', photoReference);
            cal.set('placeId', placeId);
        }
        await cal.save();
    } catch(e) {
        console.log(e);
    }
    return Promise.resolve();
};

adminRest.post('/actions/calendars/populate-image-fields', async (req: express.Request, res: express.Response) => {
    const {
        ids
    }: {
        ids: string[] | undefined;
    } = req.body;

    try {
        if (ids) {
            const where: FindOptions<CalendarAttributes> = ids ? {
                where: {
                    id: ids,
                }
            } : {};

            const { count, rows: calendars } = await models.calendar.findAndCountAll(where);
            await Promise.mapSeries(
                calendars,
                calendarMapFn
            );

            res
            .header('x-total-count', count.toFixed(0))
            .status(200)
            .json(calendars);
        } else {
            let calendars: calendar[] = [];
            let i = 0;
            do {
                calendars = await models.calendar.findAll({ limit: 20, offset: i, order:[['id', 'ASC']] });
                await Promise.mapSeries(
                    calendars,
                    calendarMapFn
                );
                console.log(`found ${calendars.length}`);
                i += calendars.length;
            } while (calendars.length !== 0);
            console.log(`total: ${i}`);

            res
            .header('x-total-count', i.toFixed(0))
            .sendStatus(200);
        }

    } catch (e) {
        respondWithError(e, res);
    }
})

export const AdminRest = adminRest;
