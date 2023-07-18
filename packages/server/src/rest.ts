import * as dotenv from 'dotenv';
import * as express from 'express';
import * as stripeClient from './stripe.js';

dotenv.config({ override: true });

import { getPhotos } from './gapi/places.js';
import { EntityClass, EntityData, EntityName, FilterQuery, Loaded, Primary, QueryOrderMap, RequiredEntityData, ValidationError, wrap } from '@mikro-orm/core';
import orm from './database.js';
import { Bio } from './models/Bio.js';
import { Acclaim } from './models/Acclaim.js';
import { Calendar } from './models/Calendar.js';
import { Piece } from './models/Piece.js';
import { Collaborator } from './models/Collaborator.js';
import { CalendarCollaborator } from './models/CalendarCollaborator.js';
import QueryString from 'qs';
import { CalendarPiece } from './models/CalendarPiece.js';
import { Music } from './models/Music.js';
import { MusicFile } from './models/MusicFile.js';
import { Disc } from './models/Disc.js';
import { DiscLink } from './models/DiscLink.js';
import { Photo } from './models/Photo.js';
import { User } from './models/User.js';
import { Product, ProductTypes } from './models/Product.js';
import { Faq } from './models/Faq.js';
import { getImageFromMetaTag } from './gapi/calendar.js';


const adminRest = express.Router();

adminRest.use(express.json());
adminRest.use(express.urlencoded({ extended: true }));

export const respondWithError = (error: any, res: express.Response): void => {
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

const mapSearchFields = <R extends object, K extends keyof R & string>(
    entity: EntityName<R>,
    searchableFields: K[],
) => (token: string) => {
    return searchableFields.map(field => {
        const name = (typeof entity === 'string') ? entity : (entity as EntityClass<R>).name;
        const typeOfField = orm.em.getMetadata().get<R>(name).properties[field].type
        if (typeOfField === 'string') {
            return {
                [field]: {
                    $ilike: `%${token}%`
                }
            }
        } else {
            return {
                [field]: token
            }
        }
    })
}

const mikroSearchFields = <R extends Object, K extends keyof R & string>(
    entity: EntityName<R>,
    searchableFields: K[],
    populate?: string[],
) => {
    const mappedFields = mapSearchFields(entity, searchableFields);
    return async ({ q, limit } : SearchParams) => {
        const tokens = q.replaceAll(', ', '|').replaceAll(' ', '&');
        const splitTokens = tokens.split('|').map(t => t.split('&'));

        const where = {
            $or: splitTokens.map(token => {
                return {
                    $and: token.map(v => {
                        return {
                            $or: mappedFields(v)
                        };
                    })
                }
            })
        } as FilterQuery<R>

        const results = await orm.em.findAndCount(
            entity,
            where,
            {
                limit,
                populate: populate as any
            }
        )

        return { rows: results[0], count: results[1] }
    }
}

interface ListReturn<R extends object> { count: number; rows: EntityData<R>[] }
interface GetListParams<R extends object> {
    filter: FilterQuery<R>;
    limit?: number;
    offset?: number;
    order: QueryOrderMap<R>[];
}

interface SearchParams {
    limit?: number;
    q: string;
}

interface RequestResponse {
    req: express.Request;
    res: express.Response;
}

class NotFoundError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'NotFound';
    }
}


interface CrudActions<I extends NonNullable<Primary<R>>, R extends object> {
    create: ((body: RequiredEntityData<R>, opts: RequestResponse) => Promise<EntityData<R> & { id: I | number | string }>) | null;
    update: ((id: I, body: EntityData<R>, opts: RequestResponse) => Promise<EntityData<R>>) | null;
    updateMany: ((ids: I[], body: EntityData<R>, opts: RequestResponse) => Promise<ListReturn<R>>) | null;
    getOne: ((id: I, opts: RequestResponse) => Promise<EntityData<R>>) | null;
    getList: ((params: GetListParams<R>, opts: RequestResponse) => Promise<ListReturn<R>>) | null;
    destroy: ((id: I, opts: RequestResponse) => Promise<{ id: I }>) | null;
    search: ((params: SearchParams, opts: RequestResponse) => Promise<ListReturn<R>>) | null;
}

interface FilterOptions<R extends object> { filters: FilterQuery<R>; primaryKeyName?: string }

const orderArrayToObj = <R extends object, K extends keyof QueryOrderMap<R>>(arr: [K, string][]): QueryOrderMap<R>[] => arr.map(([ent, ord]) => {
    const retObj: QueryOrderMap<R> = {};
    retObj[ent] = ord;
    return retObj;
})

const parseQuery = <R extends object>(query: QueryString.ParsedQs, options?: FilterOptions<R>) => {
    const {
        range,
        sort,
        filter,
    }: {
        range: string;
        sort: string;
        filter: string;
    } = query as any;

    const [from, to] = range ? JSON.parse(range as string) : [undefined, undefined]

    const {
        q,
        ...filters
    } : Record<string, unknown> & {
        q: string;
    } = JSON.parse(filter ?? '')

    return {
        offset: from as number,
        limit: (!!to) ? to - (from ?? 0) + 1 : undefined,
        filter: {
            ...(options?.filters),
            ...(filters)
        },
        order: sort ? orderArrayToObj(JSON.parse(sort)) : [{ [options?.primaryKeyName ?? 'id']: 'ASC' }],
        q
    };
};

const setGetListHeaders = (res: express.Response, total: number, rowCount: number, offset: number = 1) => {
    const rawValue = res.get('Access-Control-Expose-Headers') || '';
    if (typeof rawValue !== 'string') {
        return;
    }
    res.set('Access-Control-Expose-Headers', [rawValue, 'Content-Range', 'X-Total-Count'].join(','));
    res.set('Content-Range', `${offset.toFixed(0)}-${(offset + rowCount).toFixed(0)}/${total.toFixed(0)}`);
    res.set('X-Total-Count', `${total.toFixed(0)}`)
}

const crud = <I extends NonNullable<Primary<R>>, R extends object>(path: string, actions: CrudActions<I, R>, options?: FilterOptions<R>) => {
    const router = express.Router();
    if (actions.getList) {
        router.get(path, async (req, res, next) => {
            try {
                const { q, limit, offset, filter, order } = parseQuery(req.query, options);

                if (!q) {
                    const { rows, count } = await actions.getList!({ filter, limit, offset, order }, { req, res });
                    setGetListHeaders(res, count, rows.length, offset);
                    res.json(rows);
                } else {
                    const { rows, count } = await actions.search!({ q, limit }, { req, res });
                    setGetListHeaders(res, count, rows.length, offset);
                    res.json(rows);
                }
            } catch (e) {
                next(e);
            }
        });
    }

    if (actions.getOne) {
        router.get(`${path}/:id`, async (req, res, next) => {
            try {
                const record = await actions.getOne!(req.params.id as I, { req, res });
                res.json(record);
            } catch (e) {
                if (e instanceof NotFoundError) {
                    return res.status(404).json({
                        error: 'Record not found'
                    });
                } else {
                    next(e);
                }
            }
        })
    }

    if (actions.create) {
        router.post(path, async (req, res, next) => {
            try {
                const record = await actions.create!(req.body, { req, res });
                res.status(201).json(record);
            } catch (error) {
                next(error);
            }
        });
    }

    if (actions.update) {
        router.put(`${path}/:id`, async (req, res, next) => {
            try {
                const record = await actions.update!(req.params.id as I, req.body, { req, res });
                res.json(record);
            } catch (e) {
                if (e instanceof NotFoundError) {
                    return res.status(404).json({
                        error: 'Record not found'
                    });
                } else {
                    next(e);
                }
            }
        })
    }

    if (actions.destroy) {
        router.delete(`${path}/:id`, async (req, res, next) => {
            try {
                const id = await actions.destroy!(req.params.id as I, { req, res });
                res.json({
                    id
                });
            } catch (e) {
                if (e instanceof NotFoundError) {
                    return res.status(404).json({
                        error: 'Record not found'
                    });
                } else {
                    next(e);
                }
            }
        })
    }

    return router;
}

interface CrudParams<R extends object, K extends keyof R & string> {
    entity: EntityClass<R>;
    populate?: string[];
    searchableFields?: K[];
}

const mikroCrud = <I extends NonNullable<Primary<R>>, R extends object, K extends keyof R & string>({
    entity,
    populate,
    searchableFields,
}: CrudParams<R, K>): CrudActions<I, R> => {
    return {
        create: async body => {
            const created = orm.em.create(entity, body);
            await orm.em.persist(created).flush();
            return created as R & { id: I };
        },
        update: async (id, body) => {
            const record = await orm.em.findOneOrFail(entity, id, { failHandler: () => new NotFoundError() });
            wrap(record).assign(body, { mergeObjects: true });
            orm.em.flush();
            return record;
        },
        updateMany: async (ids, body) => {
            const [records, count] = await orm.em.findAndCount(entity, { id: { $in: ids } } as R);
            for (const record of records) {
                wrap(record).assign(body, { mergeObjects: true });
                // pojoRecords.push(wrap(record).toPOJO());
            }
            orm.em.flush();
            return {
                count,
                rows: records,
            };
        },
        getOne: async id => {
            const record = await orm.em.findOneOrFail(entity, id, { populate: populate as any, failHandler: () => new NotFoundError()});
            return record;
        },
        getList: async ({ filter, limit, offset, order }) => {
            const [rows, count] = await orm.em.findAndCount(
                entity,
                filter,
                {
                    limit,
                    offset,
                    orderBy: order,
                    populate: populate as any,
                }
            );
            return { rows, count };
        },
        destroy: async id => {
            const record = await orm.em.getReference(entity, id as NonNullable<Primary<R>>);
            await orm.em.remove(record).flush();
            return { id }
        },
        search: searchableFields ? mikroSearchFields(entity, searchableFields, populate) : null
    }
}

adminRest.use(crud('/bios', mikroCrud({ entity: Bio })));

adminRest.use(crud('/acclaims', mikroCrud({ entity: Acclaim })));
adminRest.use(crud('/calendars', {
    ...mikroCrud({ entity: Calendar }),
    getOne: async id => {
        const cal = await orm.em.findOneOrFail(
            Calendar,
            { id },
            { populate: ['collaborators', 'pieces']}
        );
        const plainCal = wrap(cal).toPOJO();
        return {
            ...plainCal,
            collaborators: plainCal.collaborators.map((val, idx) => ({ ...val, order: idx })),
            pieces: plainCal.pieces.map((val, idx) => ({ ...val, order: idx })),
        };
    },
    getList: async ({ filter, limit, offset, order }) => {
        const cals = await orm.em.findAndCount(
            Calendar,
            filter,
            {
                limit,
                offset,
                orderBy: order,
                populate: ['collaborators', 'pieces']
            }
        )
        return {
            count: cals[1],
            rows: cals[0].map((cal) => {
                const pojo = wrap(cal).toPOJO();
                return {
                    ...pojo,
                    // dateTime: transformDateTime(cal.dateTime, cal.timezone),
                    collaborators: pojo.collaborators.map((val, idx) => ({ ...val, order: idx })),
                    pieces: pojo.pieces.map((val, idx) => ({ ...val, order: idx })),
                };
            }),
        }
    },
    search: async ({ q, limit }, _) => {
        const tokens = q.replaceAll(', ', '|').replaceAll(' ', '&');
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
                populate: ['collaborators', 'pieces'],
                orderBy: [
                    { dateTime: 'DESC' }
                ],
                limit,
            });
            return {
                count: calendarResults[1],
                rows: calendarResults[0].map((cal) => {
                    const pojo = wrap(cal).toPOJO();
                    return {
                        ...pojo,
                        // dateTime: transformDateTime(cal.dateTime, cal.timezone),
                        collaborators: pojo.collaborators.map((val, idx) => ({ ...val, order: idx })),
                        pieces: pojo.pieces.map((val, idx) => ({ ...val, order: idx })),
                    };
                }),
            }
    }
}));

adminRest.use(crud('/pieces', {
    ...mikroCrud({ entity: Piece, populate: ['calendars'] }),
    search: async ({ q, limit }) => {
        const tokens = q.replaceAll(', ', '|').replaceAll(' ', '&');
        const [rows, count] = await orm.em.findAndCount(
            Piece,
            { 'Search': { $fulltext: tokens }},
            {
                populate: ['calendars'],
                limit,
            }
        );
        return {
            count,
            rows
        };
    },
}));

adminRest.use(crud('/collaborators', {
    ...mikroCrud({ entity: Collaborator, populate: ['calendars'] }),
    search: async ({ q, limit }) => {
        const tokens = q.replaceAll(', ', '|').replaceAll(' ', '&');
        const results = await orm.em.findAndCount(
            Collaborator,
            { 'Search': { $fulltext: tokens }},
            {
                populate: ['calendars'],
                limit,
            }
        );
        return {
            count: results[1],
            rows: results[0]
        };
    },
}));

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

adminRest.use(crud('/calendar-collaborators', {
    ...mikroCrud({ entity: CalendarCollaborator }),
    create: async body => {
        const createBody = body as CalendarCollaboratorCreate;
        const cal = await orm.em.findOneOrFail(Calendar, { id: createBody.calendarId });
        const collab = createBody.ref ?? orm.em.create(Collaborator, {
            name: createBody.name,
            instrument: createBody.instrument,
        });

        const calCollab = orm.em.create(
            CalendarCollaborator,
            {
                calendar: cal,
                collaborator: collab,
                order: createBody.order
            });

        if (typeof collab !== 'string') {
            orm.em.persist(collab);
        }
        orm.em.persist(calCollab);
        orm.em.flush();

        return {
            ...calCollab,
            id: cal.id,
        };
    },
    destroy: async (id) => {
        const calCollab = await orm.em.findOneOrFail(CalendarCollaborator, id);
        orm.em.remove(calCollab);
        await orm.em.flush();
        return { id };
    },
}));

adminRest.use(crud('/calendar-pieces', {
    ...mikroCrud({ entity: CalendarPiece }),
    create: async body => {
        const createBody = body as CalendarPieceCreate;
        const cal = await orm.em.findOneOrFail(Calendar, { id: createBody.calendarId });
        const piece = createBody.ref ?? orm.em.create(Piece, {
            piece: createBody.piece,
            composer: createBody.composer,
        });

        const calPiece = orm.em.create(
            CalendarPiece,
            {
                calendar: cal,
                piece,
                order: createBody.order
            });

        if (typeof piece !== 'string') {
            orm.em.persist(piece);
        }
        orm.em.persist(calPiece);
        orm.em.flush();

        return {
            ...calPiece,
            id: cal.id,
        };
    },
    destroy: async (id) => {
        const calPiece = await orm.em.findOneOrFail(CalendarPiece, id);
        orm.em.remove(calPiece);
        await orm.em.flush();
        return { id };
    },
}));

adminRest.use(crud('/musics', mikroCrud({
    entity: Music,
    populate: ['musicFiles'],
    searchableFields: ['composer', 'piece', 'contributors', 'type']
})));


adminRest.use(crud('/music-files', mikroCrud({
    entity: MusicFile,
    searchableFields: ['audioFile', 'name', 'waveformFile']
})));

adminRest.use(crud('/discs', mikroCrud({
    entity: Disc,
    populate: ['discLinks'],
    searchableFields: ['title', 'description']
})));

adminRest.use(crud('/disc-links', mikroCrud({ entity: DiscLink })));
adminRest.use(crud('/photos', mikroCrud({ entity: Photo })));
adminRest.use(crud('/users', mikroCrud({ entity: User, populate: ['products'] })));
adminRest.use(crud('/products', mikroCrud({ entity: Product })));
adminRest.use(crud('/faqs', mikroCrud({ entity: Faq })));

adminRest.post('/actions/products/pull-from-stripe', async (_: express.Request, res: express.Response) => {
    try {
        const pricesAndProducts = await stripeClient.getPricesAndProducts();
        const data = pricesAndProducts.map(prod => {
            if (!stripeClient.productIsObject(prod)) {
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
                images: (images.length !== 0) ? images.map((v) => v.replace(stripeClient.THUMBNAIL_STATIC, '')) : undefined,
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
        respondWithError(e, res);
    }
});

const populateImages = async (entity: Calendar) => {
    try {
        const {
            website,
            imageUrl,
            location,
        } = entity;

        if (website) {
            if (imageUrl === null) {
                const fetchedImageUrl = await getImageFromMetaTag(website)
                entity.imageUrl = fetchedImageUrl;
                entity.usePlacePhoto = (fetchedImageUrl === '');
            } else {
                entity.usePlacePhoto = (imageUrl === '');
            }
        }

        if (location) {
            try {
                const otherCal = await orm.em.findOne(
                    Calendar,
                    {
                        $and: [
                            { location },
                            { photoReference: { $ne: null } },
                        ],
                    },
                );
                if (!!otherCal) {
                    entity.photoReference = otherCal.photoReference;
                    entity.placeId = otherCal.placeId;
                } else {
                    const { photoReference, placeId } = await getPhotos(location);
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

adminRest.post('/actions/calendars/populate-image-fields', async (req: express.Request, res: express.Response) => {
    const {
        ids
    }: {
        ids: string[] | undefined;
    } = req.body;

    try {
        if (ids) {
            const where: FilterQuery<Calendar> = ids ? {
                id: ids
            } : {};

            const [calendars, count] = await orm.em.findAndCount(Calendar, where, { populate: ['collaborators', 'pieces']});
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
                calendars = await orm.em.find(Calendar, {}, { limit: 20, offset: i, orderBy: {id: 'ASC'} });
                for (const calendar of calendars) {
                    await populateImages(calendar);
                }
                console.log(`Updated ${calendars.length} calendars' images.`);
                await orm.em.flush();
                i += calendars.length;
            } while (calendars.length !== 0);
            console.log(`Total updated: ${i}`);

            setGetListHeaders(res, i, i);
            res.status(201);
        }

    } catch (e) {
        respondWithError(e, res);
    }
})

export const AdminRest = adminRest;
