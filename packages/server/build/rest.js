import * as dotenv from "dotenv";
import * as express from "express";
import * as stripeClient from "./stripe.js";
dotenv.config({
    override: true
});
import { getPhotos } from "./gapi/places.js";
import { ValidationError, wrap } from "@mikro-orm/core";
import orm from "./database.js";
import { Bio } from "./models/Bio.js";
import { Acclaim } from "./models/Acclaim.js";
import { Calendar } from "./models/Calendar.js";
import { Piece } from "./models/Piece.js";
import { Collaborator } from "./models/Collaborator.js";
import { CalendarCollaborator } from "./models/CalendarCollaborator.js";
import { CalendarPiece } from "./models/CalendarPiece.js";
import { Music } from "./models/Music.js";
import { MusicFile } from "./models/MusicFile.js";
import { Disc } from "./models/Disc.js";
import { DiscLink } from "./models/DiscLink.js";
import { Photo } from "./models/Photo.js";
import { User } from "./models/User.js";
import { Product } from "./models/Product.js";
import { Faq } from "./models/Faq.js";
import { getImageFromMetaTag } from "./gapi/calendar.js";
const adminRest = express.Router();
adminRest.use(express.json());
adminRest.use(express.urlencoded({
    extended: true
}));
export const respondWithError = (error, res)=>{
    console.error(error);
    if (error instanceof ValidationError) {
        res.status(400).json({
            error: error.message
        });
    } else {
        res.status(400).json({
            error
        });
    }
};
const mapSearchFields = (entity, searchableFields)=>(token)=>{
        return searchableFields.map((field)=>{
            const name = typeof entity === 'string' ? entity : entity.name;
            const typeOfField = orm.em.getMetadata().get(name).properties[field].type;
            if (typeOfField === 'string') {
                return {
                    [field]: {
                        $ilike: `%${token}%`
                    }
                };
            } else {
                return {
                    [field]: token
                };
            }
        });
    };
const mikroSearchFields = (entity, searchableFields, populate)=>{
    const mappedFields = mapSearchFields(entity, searchableFields);
    return async ({ q, limit })=>{
        const tokens = q.replaceAll(', ', '|').replaceAll(' ', '&');
        const splitTokens = tokens.split('|').map((t)=>t.split('&'));
        const where = {
            $or: splitTokens.map((token)=>{
                return {
                    $and: token.map((v)=>{
                        return {
                            $or: mappedFields(v)
                        };
                    })
                };
            })
        };
        const results = await orm.em.findAndCount(entity, where, {
            limit,
            populate: populate
        });
        return {
            rows: results[0],
            count: results[1]
        };
    };
};
class NotFoundError extends Error {
    constructor(message){
        super(message);
        this.name = 'NotFound';
    }
}
const orderArrayToObj = (arr)=>arr.map(([ent, ord])=>{
        const retObj = {};
        retObj[ent] = ord;
        return retObj;
    });
const parseQuery = (query, options)=>{
    var _options, _options1;
    const { range, sort, filter } = query;
    const [from, to] = range ? JSON.parse(range) : [
        undefined,
        undefined
    ];
    const { q, ...filters } = JSON.parse(filter ?? '');
    return {
        offset: from,
        limit: !!to ? to - (from ?? 0) + 1 : undefined,
        filter: {
            ...(_options = options) === null || _options === void 0 ? void 0 : _options.filters,
            ...filters
        },
        order: sort ? orderArrayToObj(JSON.parse(sort)) : [
            {
                [((_options1 = options) === null || _options1 === void 0 ? void 0 : _options1.primaryKeyName) ?? 'id']: 'ASC'
            }
        ],
        q
    };
};
const setGetListHeaders = (res, total, rowCount, offset = 1)=>{
    const rawValue = res.get('Access-Control-Expose-Headers') || '';
    if (typeof rawValue !== 'string') {
        return;
    }
    res.set('Access-Control-Expose-Headers', [
        rawValue,
        'Content-Range',
        'X-Total-Count'
    ].join(','));
    res.set('Content-Range', `${offset.toFixed(0)}-${(offset + rowCount).toFixed(0)}/${total.toFixed(0)}`);
    res.set('X-Total-Count', `${total.toFixed(0)}`);
};
const crud = (path, actions, options)=>{
    const router = express.Router();
    if (actions.getList) {
        router.get(path, async (req, res, next)=>{
            try {
                const { q, limit, offset, filter, order } = parseQuery(req.query, options);
                if (!q) {
                    const { rows, count } = await actions.getList({
                        filter,
                        limit,
                        offset,
                        order
                    }, {
                        req,
                        res
                    });
                    setGetListHeaders(res, count, rows.length, offset);
                    res.json(rows);
                } else {
                    const { rows, count } = await actions.search({
                        q,
                        limit
                    }, {
                        req,
                        res
                    });
                    setGetListHeaders(res, count, rows.length, offset);
                    res.json(rows);
                }
            } catch (e) {
                next(e);
            }
        });
    }
    if (actions.getOne) {
        router.get(`${path}/:id`, async (req, res, next)=>{
            try {
                const record = await actions.getOne(req.params.id, {
                    req,
                    res
                });
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
        });
    }
    if (actions.create) {
        router.post(path, async (req, res, next)=>{
            try {
                const record = await actions.create(req.body, {
                    req,
                    res
                });
                res.status(201).json(record);
            } catch (error) {
                next(error);
            }
        });
    }
    if (actions.update) {
        router.put(`${path}/:id`, async (req, res, next)=>{
            try {
                const record = await actions.update(req.params.id, req.body, {
                    req,
                    res
                });
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
        });
    }
    if (actions.destroy) {
        router.delete(`${path}/:id`, async (req, res, next)=>{
            try {
                const id = await actions.destroy(req.params.id, {
                    req,
                    res
                });
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
        });
    }
    return router;
};
const mikroCrud = ({ entity, populate, searchableFields })=>{
    return {
        create: async (body)=>{
            const created = orm.em.create(entity, body);
            await orm.em.persist(created).flush();
            return created;
        },
        update: async (id, body)=>{
            const record = await orm.em.findOneOrFail(entity, id, {
                failHandler: ()=>new NotFoundError()
            });
            wrap(record).assign(body, {
                mergeObjects: true
            });
            orm.em.flush();
            return record;
        },
        updateMany: async (ids, body)=>{
            const [records, count] = await orm.em.findAndCount(entity, {
                id: {
                    $in: ids
                }
            });
            for (const record of records){
                wrap(record).assign(body, {
                    mergeObjects: true
                });
            // pojoRecords.push(wrap(record).toPOJO());
            }
            orm.em.flush();
            return {
                count,
                rows: records
            };
        },
        getOne: async (id)=>{
            const record = await orm.em.findOneOrFail(entity, id, {
                populate: populate,
                failHandler: ()=>new NotFoundError()
            });
            return record;
        },
        getList: async ({ filter, limit, offset, order })=>{
            const [rows, count] = await orm.em.findAndCount(entity, filter, {
                limit,
                offset,
                orderBy: order,
                populate: populate
            });
            return {
                rows,
                count
            };
        },
        destroy: async (id)=>{
            const record = await orm.em.getReference(entity, id);
            await orm.em.remove(record).flush();
            return {
                id
            };
        },
        search: searchableFields ? mikroSearchFields(entity, searchableFields, populate) : null
    };
};
adminRest.use(crud('/bios', mikroCrud({
    entity: Bio
})));
adminRest.use(crud('/acclaims', mikroCrud({
    entity: Acclaim
})));
adminRest.use(crud('/calendars', {
    ...mikroCrud({
        entity: Calendar
    }),
    getOne: async (id)=>{
        const cal = await orm.em.findOneOrFail(Calendar, {
            id
        }, {
            populate: [
                'collaborators',
                'pieces'
            ]
        });
        const plainCal = wrap(cal).toPOJO();
        return {
            ...plainCal,
            collaborators: plainCal.collaborators.map((val, idx)=>({
                    ...val,
                    order: idx
                })),
            pieces: plainCal.pieces.map((val, idx)=>({
                    ...val,
                    order: idx
                }))
        };
    },
    getList: async ({ filter, limit, offset, order })=>{
        const cals = await orm.em.findAndCount(Calendar, filter, {
            limit,
            offset,
            orderBy: order,
            populate: [
                'collaborators',
                'pieces'
            ]
        });
        return {
            count: cals[1],
            rows: cals[0].map((cal)=>{
                const pojo = wrap(cal).toPOJO();
                return {
                    ...pojo,
                    // dateTime: transformDateTime(cal.dateTime, cal.timezone),
                    collaborators: pojo.collaborators.map((val, idx)=>({
                            ...val,
                            order: idx
                        })),
                    pieces: pojo.pieces.map((val, idx)=>({
                            ...val,
                            order: idx
                        }))
                };
            })
        };
    },
    search: async ({ q, limit }, _)=>{
        const tokens = q.replaceAll(', ', '|').replaceAll(' ', '&');
        const calendarResults = await orm.em.findAndCount(Calendar, {
            calendarSearchMatview: {
                Search: {
                    $fulltext: tokens
                }
            }
        }, {
            populate: [
                'collaborators',
                'pieces'
            ],
            orderBy: [
                {
                    dateTime: 'DESC'
                }
            ],
            limit
        });
        return {
            count: calendarResults[1],
            rows: calendarResults[0].map((cal)=>{
                const pojo = wrap(cal).toPOJO();
                return {
                    ...pojo,
                    // dateTime: transformDateTime(cal.dateTime, cal.timezone),
                    collaborators: pojo.collaborators.map((val, idx)=>({
                            ...val,
                            order: idx
                        })),
                    pieces: pojo.pieces.map((val, idx)=>({
                            ...val,
                            order: idx
                        }))
                };
            })
        };
    }
}));
adminRest.use(crud('/pieces', {
    ...mikroCrud({
        entity: Piece,
        populate: [
            'calendars'
        ]
    }),
    search: async ({ q, limit })=>{
        const tokens = q.replaceAll(', ', '|').replaceAll(' ', '&');
        const [rows, count] = await orm.em.findAndCount(Piece, {
            'Search': {
                $fulltext: tokens
            }
        }, {
            populate: [
                'calendars'
            ],
            limit
        });
        return {
            count,
            rows
        };
    }
}));
adminRest.use(crud('/collaborators', {
    ...mikroCrud({
        entity: Collaborator,
        populate: [
            'calendars'
        ]
    }),
    search: async ({ q, limit })=>{
        const tokens = q.replaceAll(', ', '|').replaceAll(' ', '&');
        const results = await orm.em.findAndCount(Collaborator, {
            'Search': {
                $fulltext: tokens
            }
        }, {
            populate: [
                'calendars'
            ],
            limit
        });
        return {
            count: results[1],
            rows: results[0]
        };
    }
}));
adminRest.use(crud('/calendar-collaborators', {
    ...mikroCrud({
        entity: CalendarCollaborator
    }),
    create: async (body)=>{
        const createBody = body;
        const cal = await orm.em.findOneOrFail(Calendar, {
            id: createBody.calendarId
        });
        const collab = createBody.ref ?? orm.em.create(Collaborator, {
            name: createBody.name,
            instrument: createBody.instrument
        });
        const calCollab = orm.em.create(CalendarCollaborator, {
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
            id: cal.id
        };
    },
    destroy: async (id)=>{
        const calCollab = await orm.em.findOneOrFail(CalendarCollaborator, id);
        orm.em.remove(calCollab);
        await orm.em.flush();
        return {
            id
        };
    }
}));
adminRest.use(crud('/calendar-pieces', {
    ...mikroCrud({
        entity: CalendarPiece
    }),
    create: async (body)=>{
        const createBody = body;
        const cal = await orm.em.findOneOrFail(Calendar, {
            id: createBody.calendarId
        });
        const piece = createBody.ref ?? orm.em.create(Piece, {
            piece: createBody.piece,
            composer: createBody.composer
        });
        const calPiece = orm.em.create(CalendarPiece, {
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
            id: cal.id
        };
    },
    destroy: async (id)=>{
        const calPiece = await orm.em.findOneOrFail(CalendarPiece, id);
        orm.em.remove(calPiece);
        await orm.em.flush();
        return {
            id
        };
    }
}));
adminRest.use(crud('/musics', mikroCrud({
    entity: Music,
    populate: [
        'musicFiles'
    ],
    searchableFields: [
        'composer',
        'piece',
        'contributors',
        'type'
    ]
})));
adminRest.use(crud('/music-files', mikroCrud({
    entity: MusicFile,
    searchableFields: [
        'audioFile',
        'name',
        'waveformFile'
    ]
})));
adminRest.use(crud('/discs', mikroCrud({
    entity: Disc,
    populate: [
        'discLinks'
    ],
    searchableFields: [
        'title',
        'description'
    ]
})));
adminRest.use(crud('/disc-links', mikroCrud({
    entity: DiscLink
})));
adminRest.use(crud('/photos', mikroCrud({
    entity: Photo
})));
adminRest.use(crud('/users', mikroCrud({
    entity: User,
    populate: [
        'products'
    ]
})));
adminRest.use(crud('/products', mikroCrud({
    entity: Product
})));
adminRest.use(crud('/faqs', mikroCrud({
    entity: Faq
})));
adminRest.post('/actions/products/pull-from-stripe', async (_, res)=>{
    try {
        const pricesAndProducts = await stripeClient.getPricesAndProducts();
        const data = pricesAndProducts.map((prod)=>{
            if (!stripeClient.productIsObject(prod)) {
                throw Error('Product expansion failed, or no product tied to Price.');
            }
            const { id, name, description, metadata: { type, sample, pages, permalink, file }, images, default_price } = prod;
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
                images: images.length !== 0 ? images.map((v)=>v.replace(stripeClient.THUMBNAIL_STATIC, '')) : undefined,
                type: type,
                sample,
                priceId: default_price.id ?? '',
                permalink: permalink ?? ''
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
const populateImages = async (entity)=>{
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
                    $and: [
                        {
                            location
                        },
                        {
                            photoReference: {
                                $ne: null
                            }
                        }
                    ]
                });
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
adminRest.post('/actions/calendars/populate-image-fields', async (req, res)=>{
    const { ids } = req.body;
    try {
        if (ids) {
            const where = ids ? {
                id: ids
            } : {};
            const [calendars, count] = await orm.em.findAndCount(Calendar, where, {
                populate: [
                    'collaborators',
                    'pieces'
                ]
            });
            for (const calendar of calendars){
                await populateImages(calendar);
            }
            await orm.em.flush();
            setGetListHeaders(res, count, calendars.length);
            res.status(201).json(calendars);
        } else {
            let calendars = [];
            let i = 0;
            do {
                calendars = await orm.em.find(Calendar, {}, {
                    limit: 20,
                    offset: i,
                    orderBy: {
                        id: 'ASC'
                    }
                });
                for (const calendar of calendars){
                    await populateImages(calendar);
                }
                console.log(`Updated ${calendars.length} calendars' images.`);
                await orm.em.flush();
                i += calendars.length;
            }while (calendars.length !== 0)
            console.log(`Total updated: ${i}`);
            setGetListHeaders(res, i, i);
            res.status(201);
        }
    } catch (e) {
        respondWithError(e, res);
    }
});
export const AdminRest = adminRest;

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZXN0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGRvdGVudiBmcm9tICdkb3RlbnYnO1xyXG5pbXBvcnQgKiBhcyBleHByZXNzIGZyb20gJ2V4cHJlc3MnO1xyXG5pbXBvcnQgKiBhcyBzdHJpcGVDbGllbnQgZnJvbSAnLi9zdHJpcGUuanMnO1xyXG5cclxuZG90ZW52LmNvbmZpZyh7IG92ZXJyaWRlOiB0cnVlIH0pO1xyXG5cclxuaW1wb3J0IHsgZ2V0UGhvdG9zIH0gZnJvbSAnLi9nYXBpL3BsYWNlcy5qcyc7XHJcbmltcG9ydCB7IEVudGl0eUNsYXNzLCBFbnRpdHlEYXRhLCBFbnRpdHlOYW1lLCBGaWx0ZXJRdWVyeSwgTG9hZGVkLCBQcmltYXJ5LCBRdWVyeU9yZGVyTWFwLCBSZXF1aXJlZEVudGl0eURhdGEsIFZhbGlkYXRpb25FcnJvciwgd3JhcCB9IGZyb20gJ0BtaWtyby1vcm0vY29yZSc7XHJcbmltcG9ydCBvcm0gZnJvbSAnLi9kYXRhYmFzZS5qcyc7XHJcbmltcG9ydCB7IEJpbyB9IGZyb20gJy4vbW9kZWxzL0Jpby5qcyc7XHJcbmltcG9ydCB7IEFjY2xhaW0gfSBmcm9tICcuL21vZGVscy9BY2NsYWltLmpzJztcclxuaW1wb3J0IHsgQ2FsZW5kYXIgfSBmcm9tICcuL21vZGVscy9DYWxlbmRhci5qcyc7XHJcbmltcG9ydCB7IFBpZWNlIH0gZnJvbSAnLi9tb2RlbHMvUGllY2UuanMnO1xyXG5pbXBvcnQgeyBDb2xsYWJvcmF0b3IgfSBmcm9tICcuL21vZGVscy9Db2xsYWJvcmF0b3IuanMnO1xyXG5pbXBvcnQgeyBDYWxlbmRhckNvbGxhYm9yYXRvciB9IGZyb20gJy4vbW9kZWxzL0NhbGVuZGFyQ29sbGFib3JhdG9yLmpzJztcclxuaW1wb3J0IFF1ZXJ5U3RyaW5nIGZyb20gJ3FzJztcclxuaW1wb3J0IHsgQ2FsZW5kYXJQaWVjZSB9IGZyb20gJy4vbW9kZWxzL0NhbGVuZGFyUGllY2UuanMnO1xyXG5pbXBvcnQgeyBNdXNpYyB9IGZyb20gJy4vbW9kZWxzL011c2ljLmpzJztcclxuaW1wb3J0IHsgTXVzaWNGaWxlIH0gZnJvbSAnLi9tb2RlbHMvTXVzaWNGaWxlLmpzJztcclxuaW1wb3J0IHsgRGlzYyB9IGZyb20gJy4vbW9kZWxzL0Rpc2MuanMnO1xyXG5pbXBvcnQgeyBEaXNjTGluayB9IGZyb20gJy4vbW9kZWxzL0Rpc2NMaW5rLmpzJztcclxuaW1wb3J0IHsgUGhvdG8gfSBmcm9tICcuL21vZGVscy9QaG90by5qcyc7XHJcbmltcG9ydCB7IFVzZXIgfSBmcm9tICcuL21vZGVscy9Vc2VyLmpzJztcclxuaW1wb3J0IHsgUHJvZHVjdCwgUHJvZHVjdFR5cGVzIH0gZnJvbSAnLi9tb2RlbHMvUHJvZHVjdC5qcyc7XHJcbmltcG9ydCB7IEZhcSB9IGZyb20gJy4vbW9kZWxzL0ZhcS5qcyc7XHJcbmltcG9ydCB7IGdldEltYWdlRnJvbU1ldGFUYWcgfSBmcm9tICcuL2dhcGkvY2FsZW5kYXIuanMnO1xyXG5cclxuXHJcbmNvbnN0IGFkbWluUmVzdCA9IGV4cHJlc3MuUm91dGVyKCk7XHJcblxyXG5hZG1pblJlc3QudXNlKGV4cHJlc3MuanNvbigpKTtcclxuYWRtaW5SZXN0LnVzZShleHByZXNzLnVybGVuY29kZWQoeyBleHRlbmRlZDogdHJ1ZSB9KSk7XHJcblxyXG5leHBvcnQgY29uc3QgcmVzcG9uZFdpdGhFcnJvciA9IChlcnJvcjogYW55LCByZXM6IGV4cHJlc3MuUmVzcG9uc2UpOiB2b2lkID0+IHtcclxuICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xyXG4gICAgaWYgKGVycm9yIGluc3RhbmNlb2YgVmFsaWRhdGlvbkVycm9yKSB7XHJcbiAgICAgICAgcmVzLnN0YXR1cyg0MDApLmpzb24oe1xyXG4gICAgICAgICAgICBlcnJvcjogKGVycm9yIGFzIFZhbGlkYXRpb25FcnJvcikubWVzc2FnZSxcclxuICAgICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmVzLnN0YXR1cyg0MDApLmpzb24oe1xyXG4gICAgICAgICAgICBlcnJvcixcclxuICAgICAgICB9KTtcclxuICAgIH1cclxufTtcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgUmVxdWVzdFdpdGhCb2R5IGV4dGVuZHMgZXhwcmVzcy5SZXF1ZXN0IHtcclxuICAgIGJvZHk6IHtcclxuICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgIGF0dHJpYnV0ZXM6IHtcclxuICAgICAgICAgICAgICAgIGlkczogc3RyaW5nW107XHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgfTtcclxuICAgIH07XHJcbn1cclxuXHJcbmNvbnN0IG1hcFNlYXJjaEZpZWxkcyA9IDxSIGV4dGVuZHMgb2JqZWN0LCBLIGV4dGVuZHMga2V5b2YgUiAmIHN0cmluZz4oXHJcbiAgICBlbnRpdHk6IEVudGl0eU5hbWU8Uj4sXHJcbiAgICBzZWFyY2hhYmxlRmllbGRzOiBLW10sXHJcbikgPT4gKHRva2VuOiBzdHJpbmcpID0+IHtcclxuICAgIHJldHVybiBzZWFyY2hhYmxlRmllbGRzLm1hcChmaWVsZCA9PiB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9ICh0eXBlb2YgZW50aXR5ID09PSAnc3RyaW5nJykgPyBlbnRpdHkgOiAoZW50aXR5IGFzIEVudGl0eUNsYXNzPFI+KS5uYW1lO1xyXG4gICAgICAgIGNvbnN0IHR5cGVPZkZpZWxkID0gb3JtLmVtLmdldE1ldGFkYXRhKCkuZ2V0PFI+KG5hbWUpLnByb3BlcnRpZXNbZmllbGRdLnR5cGVcclxuICAgICAgICBpZiAodHlwZU9mRmllbGQgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBbZmllbGRdOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJGlsaWtlOiBgJSR7dG9rZW59JWBcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBbZmllbGRdOiB0b2tlblxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSlcclxufVxyXG5cclxuY29uc3QgbWlrcm9TZWFyY2hGaWVsZHMgPSA8UiBleHRlbmRzIE9iamVjdCwgSyBleHRlbmRzIGtleW9mIFIgJiBzdHJpbmc+KFxyXG4gICAgZW50aXR5OiBFbnRpdHlOYW1lPFI+LFxyXG4gICAgc2VhcmNoYWJsZUZpZWxkczogS1tdLFxyXG4gICAgcG9wdWxhdGU/OiBzdHJpbmdbXSxcclxuKSA9PiB7XHJcbiAgICBjb25zdCBtYXBwZWRGaWVsZHMgPSBtYXBTZWFyY2hGaWVsZHMoZW50aXR5LCBzZWFyY2hhYmxlRmllbGRzKTtcclxuICAgIHJldHVybiBhc3luYyAoeyBxLCBsaW1pdCB9IDogU2VhcmNoUGFyYW1zKSA9PiB7XHJcbiAgICAgICAgY29uc3QgdG9rZW5zID0gcS5yZXBsYWNlQWxsKCcsICcsICd8JykucmVwbGFjZUFsbCgnICcsICcmJyk7XHJcbiAgICAgICAgY29uc3Qgc3BsaXRUb2tlbnMgPSB0b2tlbnMuc3BsaXQoJ3wnKS5tYXAodCA9PiB0LnNwbGl0KCcmJykpO1xyXG5cclxuICAgICAgICBjb25zdCB3aGVyZSA9IHtcclxuICAgICAgICAgICAgJG9yOiBzcGxpdFRva2Vucy5tYXAodG9rZW4gPT4ge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAkYW5kOiB0b2tlbi5tYXAodiA9PiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkb3I6IG1hcHBlZEZpZWxkcyh2KVxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSBhcyBGaWx0ZXJRdWVyeTxSPlxyXG5cclxuICAgICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgb3JtLmVtLmZpbmRBbmRDb3VudChcclxuICAgICAgICAgICAgZW50aXR5LFxyXG4gICAgICAgICAgICB3aGVyZSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGltaXQsXHJcbiAgICAgICAgICAgICAgICBwb3B1bGF0ZTogcG9wdWxhdGUgYXMgYW55XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICApXHJcblxyXG4gICAgICAgIHJldHVybiB7IHJvd3M6IHJlc3VsdHNbMF0sIGNvdW50OiByZXN1bHRzWzFdIH1cclxuICAgIH1cclxufVxyXG5cclxuaW50ZXJmYWNlIExpc3RSZXR1cm48UiBleHRlbmRzIG9iamVjdD4geyBjb3VudDogbnVtYmVyOyByb3dzOiBFbnRpdHlEYXRhPFI+W10gfVxyXG5pbnRlcmZhY2UgR2V0TGlzdFBhcmFtczxSIGV4dGVuZHMgb2JqZWN0PiB7XHJcbiAgICBmaWx0ZXI6IEZpbHRlclF1ZXJ5PFI+O1xyXG4gICAgbGltaXQ/OiBudW1iZXI7XHJcbiAgICBvZmZzZXQ/OiBudW1iZXI7XHJcbiAgICBvcmRlcjogUXVlcnlPcmRlck1hcDxSPltdO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgU2VhcmNoUGFyYW1zIHtcclxuICAgIGxpbWl0PzogbnVtYmVyO1xyXG4gICAgcTogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgUmVxdWVzdFJlc3BvbnNlIHtcclxuICAgIHJlcTogZXhwcmVzcy5SZXF1ZXN0O1xyXG4gICAgcmVzOiBleHByZXNzLlJlc3BvbnNlO1xyXG59XHJcblxyXG5jbGFzcyBOb3RGb3VuZEVycm9yIGV4dGVuZHMgRXJyb3Ige1xyXG4gICAgY29uc3RydWN0b3IobWVzc2FnZT86IHN0cmluZykge1xyXG4gICAgICAgIHN1cGVyKG1lc3NhZ2UpO1xyXG4gICAgICAgIHRoaXMubmFtZSA9ICdOb3RGb3VuZCc7XHJcbiAgICB9XHJcbn1cclxuXHJcblxyXG5pbnRlcmZhY2UgQ3J1ZEFjdGlvbnM8SSBleHRlbmRzIE5vbk51bGxhYmxlPFByaW1hcnk8Uj4+LCBSIGV4dGVuZHMgb2JqZWN0PiB7XHJcbiAgICBjcmVhdGU6ICgoYm9keTogUmVxdWlyZWRFbnRpdHlEYXRhPFI+LCBvcHRzOiBSZXF1ZXN0UmVzcG9uc2UpID0+IFByb21pc2U8RW50aXR5RGF0YTxSPiAmIHsgaWQ6IEkgfCBudW1iZXIgfCBzdHJpbmcgfT4pIHwgbnVsbDtcclxuICAgIHVwZGF0ZTogKChpZDogSSwgYm9keTogRW50aXR5RGF0YTxSPiwgb3B0czogUmVxdWVzdFJlc3BvbnNlKSA9PiBQcm9taXNlPEVudGl0eURhdGE8Uj4+KSB8IG51bGw7XHJcbiAgICB1cGRhdGVNYW55OiAoKGlkczogSVtdLCBib2R5OiBFbnRpdHlEYXRhPFI+LCBvcHRzOiBSZXF1ZXN0UmVzcG9uc2UpID0+IFByb21pc2U8TGlzdFJldHVybjxSPj4pIHwgbnVsbDtcclxuICAgIGdldE9uZTogKChpZDogSSwgb3B0czogUmVxdWVzdFJlc3BvbnNlKSA9PiBQcm9taXNlPEVudGl0eURhdGE8Uj4+KSB8IG51bGw7XHJcbiAgICBnZXRMaXN0OiAoKHBhcmFtczogR2V0TGlzdFBhcmFtczxSPiwgb3B0czogUmVxdWVzdFJlc3BvbnNlKSA9PiBQcm9taXNlPExpc3RSZXR1cm48Uj4+KSB8IG51bGw7XHJcbiAgICBkZXN0cm95OiAoKGlkOiBJLCBvcHRzOiBSZXF1ZXN0UmVzcG9uc2UpID0+IFByb21pc2U8eyBpZDogSSB9PikgfCBudWxsO1xyXG4gICAgc2VhcmNoOiAoKHBhcmFtczogU2VhcmNoUGFyYW1zLCBvcHRzOiBSZXF1ZXN0UmVzcG9uc2UpID0+IFByb21pc2U8TGlzdFJldHVybjxSPj4pIHwgbnVsbDtcclxufVxyXG5cclxuaW50ZXJmYWNlIEZpbHRlck9wdGlvbnM8UiBleHRlbmRzIG9iamVjdD4geyBmaWx0ZXJzOiBGaWx0ZXJRdWVyeTxSPjsgcHJpbWFyeUtleU5hbWU/OiBzdHJpbmcgfVxyXG5cclxuY29uc3Qgb3JkZXJBcnJheVRvT2JqID0gPFIgZXh0ZW5kcyBvYmplY3QsIEsgZXh0ZW5kcyBrZXlvZiBRdWVyeU9yZGVyTWFwPFI+PihhcnI6IFtLLCBzdHJpbmddW10pOiBRdWVyeU9yZGVyTWFwPFI+W10gPT4gYXJyLm1hcCgoW2VudCwgb3JkXSkgPT4ge1xyXG4gICAgY29uc3QgcmV0T2JqOiBRdWVyeU9yZGVyTWFwPFI+ID0ge307XHJcbiAgICByZXRPYmpbZW50XSA9IG9yZDtcclxuICAgIHJldHVybiByZXRPYmo7XHJcbn0pXHJcblxyXG5jb25zdCBwYXJzZVF1ZXJ5ID0gPFIgZXh0ZW5kcyBvYmplY3Q+KHF1ZXJ5OiBRdWVyeVN0cmluZy5QYXJzZWRRcywgb3B0aW9ucz86IEZpbHRlck9wdGlvbnM8Uj4pID0+IHtcclxuICAgIGNvbnN0IHtcclxuICAgICAgICByYW5nZSxcclxuICAgICAgICBzb3J0LFxyXG4gICAgICAgIGZpbHRlcixcclxuICAgIH06IHtcclxuICAgICAgICByYW5nZTogc3RyaW5nO1xyXG4gICAgICAgIHNvcnQ6IHN0cmluZztcclxuICAgICAgICBmaWx0ZXI6IHN0cmluZztcclxuICAgIH0gPSBxdWVyeSBhcyBhbnk7XHJcblxyXG4gICAgY29uc3QgW2Zyb20sIHRvXSA9IHJhbmdlID8gSlNPTi5wYXJzZShyYW5nZSBhcyBzdHJpbmcpIDogW3VuZGVmaW5lZCwgdW5kZWZpbmVkXVxyXG5cclxuICAgIGNvbnN0IHtcclxuICAgICAgICBxLFxyXG4gICAgICAgIC4uLmZpbHRlcnNcclxuICAgIH0gOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiAmIHtcclxuICAgICAgICBxOiBzdHJpbmc7XHJcbiAgICB9ID0gSlNPTi5wYXJzZShmaWx0ZXIgPz8gJycpXHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBvZmZzZXQ6IGZyb20gYXMgbnVtYmVyLFxyXG4gICAgICAgIGxpbWl0OiAoISF0bykgPyB0byAtIChmcm9tID8/IDApICsgMSA6IHVuZGVmaW5lZCxcclxuICAgICAgICBmaWx0ZXI6IHtcclxuICAgICAgICAgICAgLi4uKG9wdGlvbnM/LmZpbHRlcnMpLFxyXG4gICAgICAgICAgICAuLi4oZmlsdGVycylcclxuICAgICAgICB9LFxyXG4gICAgICAgIG9yZGVyOiBzb3J0ID8gb3JkZXJBcnJheVRvT2JqKEpTT04ucGFyc2Uoc29ydCkpIDogW3sgW29wdGlvbnM/LnByaW1hcnlLZXlOYW1lID8/ICdpZCddOiAnQVNDJyB9XSxcclxuICAgICAgICBxXHJcbiAgICB9O1xyXG59O1xyXG5cclxuY29uc3Qgc2V0R2V0TGlzdEhlYWRlcnMgPSAocmVzOiBleHByZXNzLlJlc3BvbnNlLCB0b3RhbDogbnVtYmVyLCByb3dDb3VudDogbnVtYmVyLCBvZmZzZXQ6IG51bWJlciA9IDEpID0+IHtcclxuICAgIGNvbnN0IHJhd1ZhbHVlID0gcmVzLmdldCgnQWNjZXNzLUNvbnRyb2wtRXhwb3NlLUhlYWRlcnMnKSB8fCAnJztcclxuICAgIGlmICh0eXBlb2YgcmF3VmFsdWUgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgcmVzLnNldCgnQWNjZXNzLUNvbnRyb2wtRXhwb3NlLUhlYWRlcnMnLCBbcmF3VmFsdWUsICdDb250ZW50LVJhbmdlJywgJ1gtVG90YWwtQ291bnQnXS5qb2luKCcsJykpO1xyXG4gICAgcmVzLnNldCgnQ29udGVudC1SYW5nZScsIGAke29mZnNldC50b0ZpeGVkKDApfS0keyhvZmZzZXQgKyByb3dDb3VudCkudG9GaXhlZCgwKX0vJHt0b3RhbC50b0ZpeGVkKDApfWApO1xyXG4gICAgcmVzLnNldCgnWC1Ub3RhbC1Db3VudCcsIGAke3RvdGFsLnRvRml4ZWQoMCl9YClcclxufVxyXG5cclxuY29uc3QgY3J1ZCA9IDxJIGV4dGVuZHMgTm9uTnVsbGFibGU8UHJpbWFyeTxSPj4sIFIgZXh0ZW5kcyBvYmplY3Q+KHBhdGg6IHN0cmluZywgYWN0aW9uczogQ3J1ZEFjdGlvbnM8SSwgUj4sIG9wdGlvbnM/OiBGaWx0ZXJPcHRpb25zPFI+KSA9PiB7XHJcbiAgICBjb25zdCByb3V0ZXIgPSBleHByZXNzLlJvdXRlcigpO1xyXG4gICAgaWYgKGFjdGlvbnMuZ2V0TGlzdCkge1xyXG4gICAgICAgIHJvdXRlci5nZXQocGF0aCwgYXN5bmMgKHJlcSwgcmVzLCBuZXh0KSA9PiB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB7IHEsIGxpbWl0LCBvZmZzZXQsIGZpbHRlciwgb3JkZXIgfSA9IHBhcnNlUXVlcnkocmVxLnF1ZXJ5LCBvcHRpb25zKTtcclxuXHJcbiAgICAgICAgICAgICAgICBpZiAoIXEpIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB7IHJvd3MsIGNvdW50IH0gPSBhd2FpdCBhY3Rpb25zLmdldExpc3QhKHsgZmlsdGVyLCBsaW1pdCwgb2Zmc2V0LCBvcmRlciB9LCB7IHJlcSwgcmVzIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHNldEdldExpc3RIZWFkZXJzKHJlcywgY291bnQsIHJvd3MubGVuZ3RoLCBvZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5qc29uKHJvd3MpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBjb25zdCB7IHJvd3MsIGNvdW50IH0gPSBhd2FpdCBhY3Rpb25zLnNlYXJjaCEoeyBxLCBsaW1pdCB9LCB7IHJlcSwgcmVzIH0pO1xyXG4gICAgICAgICAgICAgICAgICAgIHNldEdldExpc3RIZWFkZXJzKHJlcywgY291bnQsIHJvd3MubGVuZ3RoLCBvZmZzZXQpO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5qc29uKHJvd3MpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBuZXh0KGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFjdGlvbnMuZ2V0T25lKSB7XHJcbiAgICAgICAgcm91dGVyLmdldChgJHtwYXRofS86aWRgLCBhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlY29yZCA9IGF3YWl0IGFjdGlvbnMuZ2V0T25lIShyZXEucGFyYW1zLmlkIGFzIEksIHsgcmVxLCByZXMgfSk7XHJcbiAgICAgICAgICAgICAgICByZXMuanNvbihyZWNvcmQpO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIE5vdEZvdW5kRXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogJ1JlY29yZCBub3QgZm91bmQnXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG5leHQoZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChhY3Rpb25zLmNyZWF0ZSkge1xyXG4gICAgICAgIHJvdXRlci5wb3N0KHBhdGgsIGFzeW5jIChyZXEsIHJlcywgbmV4dCkgPT4ge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcmVjb3JkID0gYXdhaXQgYWN0aW9ucy5jcmVhdGUhKHJlcS5ib2R5LCB7IHJlcSwgcmVzIH0pO1xyXG4gICAgICAgICAgICAgICAgcmVzLnN0YXR1cygyMDEpLmpzb24ocmVjb3JkKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgIG5leHQoZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGFjdGlvbnMudXBkYXRlKSB7XHJcbiAgICAgICAgcm91dGVyLnB1dChgJHtwYXRofS86aWRgLCBhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHJlY29yZCA9IGF3YWl0IGFjdGlvbnMudXBkYXRlIShyZXEucGFyYW1zLmlkIGFzIEksIHJlcS5ib2R5LCB7IHJlcSwgcmVzIH0pO1xyXG4gICAgICAgICAgICAgICAgcmVzLmpzb24ocmVjb3JkKTtcclxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBOb3RGb3VuZEVycm9yKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcy5zdGF0dXMoNDA0KS5qc29uKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZXJyb3I6ICdSZWNvcmQgbm90IGZvdW5kJ1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBuZXh0KGUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBpZiAoYWN0aW9ucy5kZXN0cm95KSB7XHJcbiAgICAgICAgcm91dGVyLmRlbGV0ZShgJHtwYXRofS86aWRgLCBhc3luYyAocmVxLCByZXMsIG5leHQpID0+IHtcclxuICAgICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGlkID0gYXdhaXQgYWN0aW9ucy5kZXN0cm95IShyZXEucGFyYW1zLmlkIGFzIEksIHsgcmVxLCByZXMgfSk7XHJcbiAgICAgICAgICAgICAgICByZXMuanNvbih7XHJcbiAgICAgICAgICAgICAgICAgICAgaWRcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoZSBpbnN0YW5jZW9mIE5vdEZvdW5kRXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzLnN0YXR1cyg0MDQpLmpzb24oe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlcnJvcjogJ1JlY29yZCBub3QgZm91bmQnXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIG5leHQoZSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiByb3V0ZXI7XHJcbn1cclxuXHJcbmludGVyZmFjZSBDcnVkUGFyYW1zPFIgZXh0ZW5kcyBvYmplY3QsIEsgZXh0ZW5kcyBrZXlvZiBSICYgc3RyaW5nPiB7XHJcbiAgICBlbnRpdHk6IEVudGl0eUNsYXNzPFI+O1xyXG4gICAgcG9wdWxhdGU/OiBzdHJpbmdbXTtcclxuICAgIHNlYXJjaGFibGVGaWVsZHM/OiBLW107XHJcbn1cclxuXHJcbmNvbnN0IG1pa3JvQ3J1ZCA9IDxJIGV4dGVuZHMgTm9uTnVsbGFibGU8UHJpbWFyeTxSPj4sIFIgZXh0ZW5kcyBvYmplY3QsIEsgZXh0ZW5kcyBrZXlvZiBSICYgc3RyaW5nPih7XHJcbiAgICBlbnRpdHksXHJcbiAgICBwb3B1bGF0ZSxcclxuICAgIHNlYXJjaGFibGVGaWVsZHMsXHJcbn06IENydWRQYXJhbXM8UiwgSz4pOiBDcnVkQWN0aW9uczxJLCBSPiA9PiB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGNyZWF0ZTogYXN5bmMgYm9keSA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNyZWF0ZWQgPSBvcm0uZW0uY3JlYXRlKGVudGl0eSwgYm9keSk7XHJcbiAgICAgICAgICAgIGF3YWl0IG9ybS5lbS5wZXJzaXN0KGNyZWF0ZWQpLmZsdXNoKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBjcmVhdGVkIGFzIFIgJiB7IGlkOiBJIH07XHJcbiAgICAgICAgfSxcclxuICAgICAgICB1cGRhdGU6IGFzeW5jIChpZCwgYm9keSkgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCByZWNvcmQgPSBhd2FpdCBvcm0uZW0uZmluZE9uZU9yRmFpbChlbnRpdHksIGlkLCB7IGZhaWxIYW5kbGVyOiAoKSA9PiBuZXcgTm90Rm91bmRFcnJvcigpIH0pO1xyXG4gICAgICAgICAgICB3cmFwKHJlY29yZCkuYXNzaWduKGJvZHksIHsgbWVyZ2VPYmplY3RzOiB0cnVlIH0pO1xyXG4gICAgICAgICAgICBvcm0uZW0uZmx1c2goKTtcclxuICAgICAgICAgICAgcmV0dXJuIHJlY29yZDtcclxuICAgICAgICB9LFxyXG4gICAgICAgIHVwZGF0ZU1hbnk6IGFzeW5jIChpZHMsIGJvZHkpID0+IHtcclxuICAgICAgICAgICAgY29uc3QgW3JlY29yZHMsIGNvdW50XSA9IGF3YWl0IG9ybS5lbS5maW5kQW5kQ291bnQoZW50aXR5LCB7IGlkOiB7ICRpbjogaWRzIH0gfSBhcyBSKTtcclxuICAgICAgICAgICAgZm9yIChjb25zdCByZWNvcmQgb2YgcmVjb3Jkcykge1xyXG4gICAgICAgICAgICAgICAgd3JhcChyZWNvcmQpLmFzc2lnbihib2R5LCB7IG1lcmdlT2JqZWN0czogdHJ1ZSB9KTtcclxuICAgICAgICAgICAgICAgIC8vIHBvam9SZWNvcmRzLnB1c2god3JhcChyZWNvcmQpLnRvUE9KTygpKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvcm0uZW0uZmx1c2goKTtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIGNvdW50LFxyXG4gICAgICAgICAgICAgICAgcm93czogcmVjb3JkcyxcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIGdldE9uZTogYXN5bmMgaWQgPT4ge1xyXG4gICAgICAgICAgICBjb25zdCByZWNvcmQgPSBhd2FpdCBvcm0uZW0uZmluZE9uZU9yRmFpbChlbnRpdHksIGlkLCB7IHBvcHVsYXRlOiBwb3B1bGF0ZSBhcyBhbnksIGZhaWxIYW5kbGVyOiAoKSA9PiBuZXcgTm90Rm91bmRFcnJvcigpfSk7XHJcbiAgICAgICAgICAgIHJldHVybiByZWNvcmQ7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBnZXRMaXN0OiBhc3luYyAoeyBmaWx0ZXIsIGxpbWl0LCBvZmZzZXQsIG9yZGVyIH0pID0+IHtcclxuICAgICAgICAgICAgY29uc3QgW3Jvd3MsIGNvdW50XSA9IGF3YWl0IG9ybS5lbS5maW5kQW5kQ291bnQoXHJcbiAgICAgICAgICAgICAgICBlbnRpdHksXHJcbiAgICAgICAgICAgICAgICBmaWx0ZXIsXHJcbiAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgbGltaXQsXHJcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0LFxyXG4gICAgICAgICAgICAgICAgICAgIG9yZGVyQnk6IG9yZGVyLFxyXG4gICAgICAgICAgICAgICAgICAgIHBvcHVsYXRlOiBwb3B1bGF0ZSBhcyBhbnksXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIHJldHVybiB7IHJvd3MsIGNvdW50IH07XHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZXN0cm95OiBhc3luYyBpZCA9PiB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlY29yZCA9IGF3YWl0IG9ybS5lbS5nZXRSZWZlcmVuY2UoZW50aXR5LCBpZCBhcyBOb25OdWxsYWJsZTxQcmltYXJ5PFI+Pik7XHJcbiAgICAgICAgICAgIGF3YWl0IG9ybS5lbS5yZW1vdmUocmVjb3JkKS5mbHVzaCgpO1xyXG4gICAgICAgICAgICByZXR1cm4geyBpZCB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZWFyY2g6IHNlYXJjaGFibGVGaWVsZHMgPyBtaWtyb1NlYXJjaEZpZWxkcyhlbnRpdHksIHNlYXJjaGFibGVGaWVsZHMsIHBvcHVsYXRlKSA6IG51bGxcclxuICAgIH1cclxufVxyXG5cclxuYWRtaW5SZXN0LnVzZShjcnVkKCcvYmlvcycsIG1pa3JvQ3J1ZCh7IGVudGl0eTogQmlvIH0pKSk7XHJcblxyXG5hZG1pblJlc3QudXNlKGNydWQoJy9hY2NsYWltcycsIG1pa3JvQ3J1ZCh7IGVudGl0eTogQWNjbGFpbSB9KSkpO1xyXG5hZG1pblJlc3QudXNlKGNydWQoJy9jYWxlbmRhcnMnLCB7XHJcbiAgICAuLi5taWtyb0NydWQoeyBlbnRpdHk6IENhbGVuZGFyIH0pLFxyXG4gICAgZ2V0T25lOiBhc3luYyBpZCA9PiB7XHJcbiAgICAgICAgY29uc3QgY2FsID0gYXdhaXQgb3JtLmVtLmZpbmRPbmVPckZhaWwoXHJcbiAgICAgICAgICAgIENhbGVuZGFyLFxyXG4gICAgICAgICAgICB7IGlkIH0sXHJcbiAgICAgICAgICAgIHsgcG9wdWxhdGU6IFsnY29sbGFib3JhdG9ycycsICdwaWVjZXMnXX1cclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IHBsYWluQ2FsID0gd3JhcChjYWwpLnRvUE9KTygpO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIC4uLnBsYWluQ2FsLFxyXG4gICAgICAgICAgICBjb2xsYWJvcmF0b3JzOiBwbGFpbkNhbC5jb2xsYWJvcmF0b3JzLm1hcCgodmFsLCBpZHgpID0+ICh7IC4uLnZhbCwgb3JkZXI6IGlkeCB9KSksXHJcbiAgICAgICAgICAgIHBpZWNlczogcGxhaW5DYWwucGllY2VzLm1hcCgodmFsLCBpZHgpID0+ICh7IC4uLnZhbCwgb3JkZXI6IGlkeCB9KSksXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbiAgICBnZXRMaXN0OiBhc3luYyAoeyBmaWx0ZXIsIGxpbWl0LCBvZmZzZXQsIG9yZGVyIH0pID0+IHtcclxuICAgICAgICBjb25zdCBjYWxzID0gYXdhaXQgb3JtLmVtLmZpbmRBbmRDb3VudChcclxuICAgICAgICAgICAgQ2FsZW5kYXIsXHJcbiAgICAgICAgICAgIGZpbHRlcixcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgbGltaXQsXHJcbiAgICAgICAgICAgICAgICBvZmZzZXQsXHJcbiAgICAgICAgICAgICAgICBvcmRlckJ5OiBvcmRlcixcclxuICAgICAgICAgICAgICAgIHBvcHVsYXRlOiBbJ2NvbGxhYm9yYXRvcnMnLCAncGllY2VzJ11cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIClcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBjb3VudDogY2Fsc1sxXSxcclxuICAgICAgICAgICAgcm93czogY2Fsc1swXS5tYXAoKGNhbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgcG9qbyA9IHdyYXAoY2FsKS50b1BPSk8oKTtcclxuICAgICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICAgICAgLi4ucG9qbyxcclxuICAgICAgICAgICAgICAgICAgICAvLyBkYXRlVGltZTogdHJhbnNmb3JtRGF0ZVRpbWUoY2FsLmRhdGVUaW1lLCBjYWwudGltZXpvbmUpLFxyXG4gICAgICAgICAgICAgICAgICAgIGNvbGxhYm9yYXRvcnM6IHBvam8uY29sbGFib3JhdG9ycy5tYXAoKHZhbCwgaWR4KSA9PiAoeyAuLi52YWwsIG9yZGVyOiBpZHggfSkpLFxyXG4gICAgICAgICAgICAgICAgICAgIHBpZWNlczogcG9qby5waWVjZXMubWFwKCh2YWwsIGlkeCkgPT4gKHsgLi4udmFsLCBvcmRlcjogaWR4IH0pKSxcclxuICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgIH1cclxuICAgIH0sXHJcbiAgICBzZWFyY2g6IGFzeW5jICh7IHEsIGxpbWl0IH0sIF8pID0+IHtcclxuICAgICAgICBjb25zdCB0b2tlbnMgPSBxLnJlcGxhY2VBbGwoJywgJywgJ3wnKS5yZXBsYWNlQWxsKCcgJywgJyYnKTtcclxuICAgICAgICBjb25zdCBjYWxlbmRhclJlc3VsdHMgPSBhd2FpdCBvcm0uZW0uZmluZEFuZENvdW50KFxyXG4gICAgICAgICAgICBDYWxlbmRhcixcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2FsZW5kYXJTZWFyY2hNYXR2aWV3OiB7XHJcbiAgICAgICAgICAgICAgICAgICAgU2VhcmNoOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRmdWxsdGV4dDogdG9rZW5zLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBwb3B1bGF0ZTogWydjb2xsYWJvcmF0b3JzJywgJ3BpZWNlcyddLFxyXG4gICAgICAgICAgICAgICAgb3JkZXJCeTogW1xyXG4gICAgICAgICAgICAgICAgICAgIHsgZGF0ZVRpbWU6ICdERVNDJyB9XHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgbGltaXQsXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgY291bnQ6IGNhbGVuZGFyUmVzdWx0c1sxXSxcclxuICAgICAgICAgICAgICAgIHJvd3M6IGNhbGVuZGFyUmVzdWx0c1swXS5tYXAoKGNhbCkgPT4ge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHBvam8gPSB3cmFwKGNhbCkudG9QT0pPKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgLi4ucG9qbyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gZGF0ZVRpbWU6IHRyYW5zZm9ybURhdGVUaW1lKGNhbC5kYXRlVGltZSwgY2FsLnRpbWV6b25lKSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGFib3JhdG9yczogcG9qby5jb2xsYWJvcmF0b3JzLm1hcCgodmFsLCBpZHgpID0+ICh7IC4uLnZhbCwgb3JkZXI6IGlkeCB9KSksXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHBpZWNlczogcG9qby5waWVjZXMubWFwKCh2YWwsIGlkeCkgPT4gKHsgLi4udmFsLCBvcmRlcjogaWR4IH0pKSxcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgfSksXHJcbiAgICAgICAgICAgIH1cclxuICAgIH1cclxufSkpO1xyXG5cclxuYWRtaW5SZXN0LnVzZShjcnVkKCcvcGllY2VzJywge1xyXG4gICAgLi4ubWlrcm9DcnVkKHsgZW50aXR5OiBQaWVjZSwgcG9wdWxhdGU6IFsnY2FsZW5kYXJzJ10gfSksXHJcbiAgICBzZWFyY2g6IGFzeW5jICh7IHEsIGxpbWl0IH0pID0+IHtcclxuICAgICAgICBjb25zdCB0b2tlbnMgPSBxLnJlcGxhY2VBbGwoJywgJywgJ3wnKS5yZXBsYWNlQWxsKCcgJywgJyYnKTtcclxuICAgICAgICBjb25zdCBbcm93cywgY291bnRdID0gYXdhaXQgb3JtLmVtLmZpbmRBbmRDb3VudChcclxuICAgICAgICAgICAgUGllY2UsXHJcbiAgICAgICAgICAgIHsgJ1NlYXJjaCc6IHsgJGZ1bGx0ZXh0OiB0b2tlbnMgfX0sXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIHBvcHVsYXRlOiBbJ2NhbGVuZGFycyddLFxyXG4gICAgICAgICAgICAgICAgbGltaXQsXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICApO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGNvdW50LFxyXG4gICAgICAgICAgICByb3dzXHJcbiAgICAgICAgfTtcclxuICAgIH0sXHJcbn0pKTtcclxuXHJcbmFkbWluUmVzdC51c2UoY3J1ZCgnL2NvbGxhYm9yYXRvcnMnLCB7XHJcbiAgICAuLi5taWtyb0NydWQoeyBlbnRpdHk6IENvbGxhYm9yYXRvciwgcG9wdWxhdGU6IFsnY2FsZW5kYXJzJ10gfSksXHJcbiAgICBzZWFyY2g6IGFzeW5jICh7IHEsIGxpbWl0IH0pID0+IHtcclxuICAgICAgICBjb25zdCB0b2tlbnMgPSBxLnJlcGxhY2VBbGwoJywgJywgJ3wnKS5yZXBsYWNlQWxsKCcgJywgJyYnKTtcclxuICAgICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgb3JtLmVtLmZpbmRBbmRDb3VudChcclxuICAgICAgICAgICAgQ29sbGFib3JhdG9yLFxyXG4gICAgICAgICAgICB7ICdTZWFyY2gnOiB7ICRmdWxsdGV4dDogdG9rZW5zIH19LFxyXG4gICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICBwb3B1bGF0ZTogWydjYWxlbmRhcnMnXSxcclxuICAgICAgICAgICAgICAgIGxpbWl0LFxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgKTtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBjb3VudDogcmVzdWx0c1sxXSxcclxuICAgICAgICAgICAgcm93czogcmVzdWx0c1swXVxyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG59KSk7XHJcblxyXG5pbnRlcmZhY2UgQ2FsZW5kYXJQaWVjZUNyZWF0ZSBleHRlbmRzIEVudGl0eURhdGE8Q2FsZW5kYXJQaWVjZT4ge1xyXG4gICAgcmVmPzogc3RyaW5nO1xyXG4gICAgY29tcG9zZXI6IHN0cmluZztcclxuICAgIHBpZWNlOiBzdHJpbmc7XHJcbiAgICBvcmRlcjogbnVtYmVyO1xyXG4gICAgY2FsZW5kYXJJZDogc3RyaW5nO1xyXG59XHJcblxyXG5pbnRlcmZhY2UgQ2FsZW5kYXJDb2xsYWJvcmF0b3JDcmVhdGUgZXh0ZW5kcyBFbnRpdHlEYXRhPENhbGVuZGFyQ29sbGFib3JhdG9yPiB7XHJcbiAgICByZWY/OiBzdHJpbmc7XHJcbiAgICBuYW1lOiBzdHJpbmc7XHJcbiAgICBpbnN0cnVtZW50OiBzdHJpbmc7XHJcbiAgICBvcmRlcjogbnVtYmVyO1xyXG4gICAgY2FsZW5kYXJJZDogc3RyaW5nO1xyXG59XHJcblxyXG5hZG1pblJlc3QudXNlKGNydWQoJy9jYWxlbmRhci1jb2xsYWJvcmF0b3JzJywge1xyXG4gICAgLi4ubWlrcm9DcnVkKHsgZW50aXR5OiBDYWxlbmRhckNvbGxhYm9yYXRvciB9KSxcclxuICAgIGNyZWF0ZTogYXN5bmMgYm9keSA9PiB7XHJcbiAgICAgICAgY29uc3QgY3JlYXRlQm9keSA9IGJvZHkgYXMgQ2FsZW5kYXJDb2xsYWJvcmF0b3JDcmVhdGU7XHJcbiAgICAgICAgY29uc3QgY2FsID0gYXdhaXQgb3JtLmVtLmZpbmRPbmVPckZhaWwoQ2FsZW5kYXIsIHsgaWQ6IGNyZWF0ZUJvZHkuY2FsZW5kYXJJZCB9KTtcclxuICAgICAgICBjb25zdCBjb2xsYWIgPSBjcmVhdGVCb2R5LnJlZiA/PyBvcm0uZW0uY3JlYXRlKENvbGxhYm9yYXRvciwge1xyXG4gICAgICAgICAgICBuYW1lOiBjcmVhdGVCb2R5Lm5hbWUsXHJcbiAgICAgICAgICAgIGluc3RydW1lbnQ6IGNyZWF0ZUJvZHkuaW5zdHJ1bWVudCxcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgY29uc3QgY2FsQ29sbGFiID0gb3JtLmVtLmNyZWF0ZShcclxuICAgICAgICAgICAgQ2FsZW5kYXJDb2xsYWJvcmF0b3IsXHJcbiAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgIGNhbGVuZGFyOiBjYWwsXHJcbiAgICAgICAgICAgICAgICBjb2xsYWJvcmF0b3I6IGNvbGxhYixcclxuICAgICAgICAgICAgICAgIG9yZGVyOiBjcmVhdGVCb2R5Lm9yZGVyXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICBpZiAodHlwZW9mIGNvbGxhYiAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgb3JtLmVtLnBlcnNpc3QoY29sbGFiKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgb3JtLmVtLnBlcnNpc3QoY2FsQ29sbGFiKTtcclxuICAgICAgICBvcm0uZW0uZmx1c2goKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgLi4uY2FsQ29sbGFiLFxyXG4gICAgICAgICAgICBpZDogY2FsLmlkLFxyXG4gICAgICAgIH07XHJcbiAgICB9LFxyXG4gICAgZGVzdHJveTogYXN5bmMgKGlkKSA9PiB7XHJcbiAgICAgICAgY29uc3QgY2FsQ29sbGFiID0gYXdhaXQgb3JtLmVtLmZpbmRPbmVPckZhaWwoQ2FsZW5kYXJDb2xsYWJvcmF0b3IsIGlkKTtcclxuICAgICAgICBvcm0uZW0ucmVtb3ZlKGNhbENvbGxhYik7XHJcbiAgICAgICAgYXdhaXQgb3JtLmVtLmZsdXNoKCk7XHJcbiAgICAgICAgcmV0dXJuIHsgaWQgfTtcclxuICAgIH0sXHJcbn0pKTtcclxuXHJcbmFkbWluUmVzdC51c2UoY3J1ZCgnL2NhbGVuZGFyLXBpZWNlcycsIHtcclxuICAgIC4uLm1pa3JvQ3J1ZCh7IGVudGl0eTogQ2FsZW5kYXJQaWVjZSB9KSxcclxuICAgIGNyZWF0ZTogYXN5bmMgYm9keSA9PiB7XHJcbiAgICAgICAgY29uc3QgY3JlYXRlQm9keSA9IGJvZHkgYXMgQ2FsZW5kYXJQaWVjZUNyZWF0ZTtcclxuICAgICAgICBjb25zdCBjYWwgPSBhd2FpdCBvcm0uZW0uZmluZE9uZU9yRmFpbChDYWxlbmRhciwgeyBpZDogY3JlYXRlQm9keS5jYWxlbmRhcklkIH0pO1xyXG4gICAgICAgIGNvbnN0IHBpZWNlID0gY3JlYXRlQm9keS5yZWYgPz8gb3JtLmVtLmNyZWF0ZShQaWVjZSwge1xyXG4gICAgICAgICAgICBwaWVjZTogY3JlYXRlQm9keS5waWVjZSxcclxuICAgICAgICAgICAgY29tcG9zZXI6IGNyZWF0ZUJvZHkuY29tcG9zZXIsXHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGNvbnN0IGNhbFBpZWNlID0gb3JtLmVtLmNyZWF0ZShcclxuICAgICAgICAgICAgQ2FsZW5kYXJQaWVjZSxcclxuICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgY2FsZW5kYXI6IGNhbCxcclxuICAgICAgICAgICAgICAgIHBpZWNlLFxyXG4gICAgICAgICAgICAgICAgb3JkZXI6IGNyZWF0ZUJvZHkub3JkZXJcclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmICh0eXBlb2YgcGllY2UgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIG9ybS5lbS5wZXJzaXN0KHBpZWNlKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgb3JtLmVtLnBlcnNpc3QoY2FsUGllY2UpO1xyXG4gICAgICAgIG9ybS5lbS5mbHVzaCgpO1xyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAuLi5jYWxQaWVjZSxcclxuICAgICAgICAgICAgaWQ6IGNhbC5pZCxcclxuICAgICAgICB9O1xyXG4gICAgfSxcclxuICAgIGRlc3Ryb3k6IGFzeW5jIChpZCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGNhbFBpZWNlID0gYXdhaXQgb3JtLmVtLmZpbmRPbmVPckZhaWwoQ2FsZW5kYXJQaWVjZSwgaWQpO1xyXG4gICAgICAgIG9ybS5lbS5yZW1vdmUoY2FsUGllY2UpO1xyXG4gICAgICAgIGF3YWl0IG9ybS5lbS5mbHVzaCgpO1xyXG4gICAgICAgIHJldHVybiB7IGlkIH07XHJcbiAgICB9LFxyXG59KSk7XHJcblxyXG5hZG1pblJlc3QudXNlKGNydWQoJy9tdXNpY3MnLCBtaWtyb0NydWQoe1xyXG4gICAgZW50aXR5OiBNdXNpYyxcclxuICAgIHBvcHVsYXRlOiBbJ211c2ljRmlsZXMnXSxcclxuICAgIHNlYXJjaGFibGVGaWVsZHM6IFsnY29tcG9zZXInLCAncGllY2UnLCAnY29udHJpYnV0b3JzJywgJ3R5cGUnXVxyXG59KSkpO1xyXG5cclxuXHJcbmFkbWluUmVzdC51c2UoY3J1ZCgnL211c2ljLWZpbGVzJywgbWlrcm9DcnVkKHtcclxuICAgIGVudGl0eTogTXVzaWNGaWxlLFxyXG4gICAgc2VhcmNoYWJsZUZpZWxkczogWydhdWRpb0ZpbGUnLCAnbmFtZScsICd3YXZlZm9ybUZpbGUnXVxyXG59KSkpO1xyXG5cclxuYWRtaW5SZXN0LnVzZShjcnVkKCcvZGlzY3MnLCBtaWtyb0NydWQoe1xyXG4gICAgZW50aXR5OiBEaXNjLFxyXG4gICAgcG9wdWxhdGU6IFsnZGlzY0xpbmtzJ10sXHJcbiAgICBzZWFyY2hhYmxlRmllbGRzOiBbJ3RpdGxlJywgJ2Rlc2NyaXB0aW9uJ11cclxufSkpKTtcclxuXHJcbmFkbWluUmVzdC51c2UoY3J1ZCgnL2Rpc2MtbGlua3MnLCBtaWtyb0NydWQoeyBlbnRpdHk6IERpc2NMaW5rIH0pKSk7XHJcbmFkbWluUmVzdC51c2UoY3J1ZCgnL3Bob3RvcycsIG1pa3JvQ3J1ZCh7IGVudGl0eTogUGhvdG8gfSkpKTtcclxuYWRtaW5SZXN0LnVzZShjcnVkKCcvdXNlcnMnLCBtaWtyb0NydWQoeyBlbnRpdHk6IFVzZXIsIHBvcHVsYXRlOiBbJ3Byb2R1Y3RzJ10gfSkpKTtcclxuYWRtaW5SZXN0LnVzZShjcnVkKCcvcHJvZHVjdHMnLCBtaWtyb0NydWQoeyBlbnRpdHk6IFByb2R1Y3QgfSkpKTtcclxuYWRtaW5SZXN0LnVzZShjcnVkKCcvZmFxcycsIG1pa3JvQ3J1ZCh7IGVudGl0eTogRmFxIH0pKSk7XHJcblxyXG5hZG1pblJlc3QucG9zdCgnL2FjdGlvbnMvcHJvZHVjdHMvcHVsbC1mcm9tLXN0cmlwZScsIGFzeW5jIChfOiBleHByZXNzLlJlcXVlc3QsIHJlczogZXhwcmVzcy5SZXNwb25zZSkgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBwcmljZXNBbmRQcm9kdWN0cyA9IGF3YWl0IHN0cmlwZUNsaWVudC5nZXRQcmljZXNBbmRQcm9kdWN0cygpO1xyXG4gICAgICAgIGNvbnN0IGRhdGEgPSBwcmljZXNBbmRQcm9kdWN0cy5tYXAocHJvZCA9PiB7XHJcbiAgICAgICAgICAgIGlmICghc3RyaXBlQ2xpZW50LnByb2R1Y3RJc09iamVjdChwcm9kKSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ1Byb2R1Y3QgZXhwYW5zaW9uIGZhaWxlZCwgb3Igbm8gcHJvZHVjdCB0aWVkIHRvIFByaWNlLicpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGNvbnN0IHtcclxuICAgICAgICAgICAgICAgIGlkLFxyXG4gICAgICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uLFxyXG4gICAgICAgICAgICAgICAgbWV0YWRhdGE6IHtcclxuICAgICAgICAgICAgICAgICAgICB0eXBlLCBzYW1wbGUsIHBhZ2VzLCBwZXJtYWxpbmssIGZpbGVcclxuICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBpbWFnZXMsXHJcbiAgICAgICAgICAgICAgICBkZWZhdWx0X3ByaWNlLFxyXG4gICAgICAgICAgICB9ID0gcHJvZDtcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBkZWZhdWx0X3ByaWNlID09PSAnc3RyaW5nJyB8fCAhZGVmYXVsdF9wcmljZSkge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgRXJyb3IoJ2RlZmF1bHRfcHJpY2Ugbm90IGV4cGFuZGVkJyk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBpZCxcclxuICAgICAgICAgICAgICAgIG5hbWUsXHJcbiAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24gPz8gJycsXHJcbiAgICAgICAgICAgICAgICBwcmljZTogZGVmYXVsdF9wcmljZS51bml0X2Ftb3VudCA/PyAwLFxyXG4gICAgICAgICAgICAgICAgcGFnZXM6IHBhcnNlSW50KHBhZ2VzKSxcclxuICAgICAgICAgICAgICAgIGZpbGU6IGZpbGUgPz8gJycsXHJcbiAgICAgICAgICAgICAgICBpbWFnZXM6IChpbWFnZXMubGVuZ3RoICE9PSAwKSA/IGltYWdlcy5tYXAoKHYpID0+IHYucmVwbGFjZShzdHJpcGVDbGllbnQuVEhVTUJOQUlMX1NUQVRJQywgJycpKSA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgICAgICAgIHR5cGU6IHR5cGUgYXMgdHlwZW9mIFByb2R1Y3RUeXBlc1tudW1iZXJdLFxyXG4gICAgICAgICAgICAgICAgc2FtcGxlLFxyXG4gICAgICAgICAgICAgICAgcHJpY2VJZDogZGVmYXVsdF9wcmljZS5pZCA/PyAnJyxcclxuICAgICAgICAgICAgICAgIHBlcm1hbGluazogcGVybWFsaW5rID8/ICcnLFxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNvbnN0IHByb2R1Y3RzID0gYXdhaXQgb3JtLmVtLnVwc2VydE1hbnkoUHJvZHVjdCwgZGF0YSk7XHJcbiAgICAgICAgY29uc3QgY291bnQgPSBhd2FpdCBvcm0uZW0uY291bnQoUHJvZHVjdCwge30pO1xyXG5cclxuICAgICAgICBzZXRHZXRMaXN0SGVhZGVycyhyZXMsIGNvdW50LCBwcm9kdWN0cy5sZW5ndGgpO1xyXG4gICAgICAgIHJlcy5zdGF0dXMoMjAxKS5qc29uKHByb2R1Y3RzKTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICByZXNwb25kV2l0aEVycm9yKGUsIHJlcyk7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuY29uc3QgcG9wdWxhdGVJbWFnZXMgPSBhc3luYyAoZW50aXR5OiBDYWxlbmRhcikgPT4ge1xyXG4gICAgdHJ5IHtcclxuICAgICAgICBjb25zdCB7XHJcbiAgICAgICAgICAgIHdlYnNpdGUsXHJcbiAgICAgICAgICAgIGltYWdlVXJsLFxyXG4gICAgICAgICAgICBsb2NhdGlvbixcclxuICAgICAgICB9ID0gZW50aXR5O1xyXG5cclxuICAgICAgICBpZiAod2Vic2l0ZSkge1xyXG4gICAgICAgICAgICBpZiAoaW1hZ2VVcmwgPT09IG51bGwpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGZldGNoZWRJbWFnZVVybCA9IGF3YWl0IGdldEltYWdlRnJvbU1ldGFUYWcod2Vic2l0ZSlcclxuICAgICAgICAgICAgICAgIGVudGl0eS5pbWFnZVVybCA9IGZldGNoZWRJbWFnZVVybDtcclxuICAgICAgICAgICAgICAgIGVudGl0eS51c2VQbGFjZVBob3RvID0gKGZldGNoZWRJbWFnZVVybCA9PT0gJycpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgZW50aXR5LnVzZVBsYWNlUGhvdG8gPSAoaW1hZ2VVcmwgPT09ICcnKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKGxvY2F0aW9uKSB7XHJcbiAgICAgICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgICAgICBjb25zdCBvdGhlckNhbCA9IGF3YWl0IG9ybS5lbS5maW5kT25lKFxyXG4gICAgICAgICAgICAgICAgICAgIENhbGVuZGFyLFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJGFuZDogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBsb2NhdGlvbiB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeyBwaG90b1JlZmVyZW5jZTogeyAkbmU6IG51bGwgfSB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICApO1xyXG4gICAgICAgICAgICAgICAgaWYgKCEhb3RoZXJDYWwpIHtcclxuICAgICAgICAgICAgICAgICAgICBlbnRpdHkucGhvdG9SZWZlcmVuY2UgPSBvdGhlckNhbC5waG90b1JlZmVyZW5jZTtcclxuICAgICAgICAgICAgICAgICAgICBlbnRpdHkucGxhY2VJZCA9IG90aGVyQ2FsLnBsYWNlSWQ7XHJcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHsgcGhvdG9SZWZlcmVuY2UsIHBsYWNlSWQgfSA9IGF3YWl0IGdldFBob3Rvcyhsb2NhdGlvbik7XHJcbiAgICAgICAgICAgICAgICAgICAgZW50aXR5LnBob3RvUmVmZXJlbmNlID0gcGhvdG9SZWZlcmVuY2U7XHJcbiAgICAgICAgICAgICAgICAgICAgZW50aXR5LnBsYWNlSWQgPSBwbGFjZUlkO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgW0hvb2s6IEJlZm9yZUNyZWF0ZV0gJHtlfWApO1xyXG4gICAgICAgICAgICAgICAgZW50aXR5LnBob3RvUmVmZXJlbmNlID0gJyc7XHJcbiAgICAgICAgICAgICAgICBlbnRpdHkucGxhY2VJZCA9ICcnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGUpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuYWRtaW5SZXN0LnBvc3QoJy9hY3Rpb25zL2NhbGVuZGFycy9wb3B1bGF0ZS1pbWFnZS1maWVsZHMnLCBhc3luYyAocmVxOiBleHByZXNzLlJlcXVlc3QsIHJlczogZXhwcmVzcy5SZXNwb25zZSkgPT4ge1xyXG4gICAgY29uc3Qge1xyXG4gICAgICAgIGlkc1xyXG4gICAgfToge1xyXG4gICAgICAgIGlkczogc3RyaW5nW10gfCB1bmRlZmluZWQ7XHJcbiAgICB9ID0gcmVxLmJvZHk7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgICBpZiAoaWRzKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHdoZXJlOiBGaWx0ZXJRdWVyeTxDYWxlbmRhcj4gPSBpZHMgPyB7XHJcbiAgICAgICAgICAgICAgICBpZDogaWRzXHJcbiAgICAgICAgICAgIH0gOiB7fTtcclxuXHJcbiAgICAgICAgICAgIGNvbnN0IFtjYWxlbmRhcnMsIGNvdW50XSA9IGF3YWl0IG9ybS5lbS5maW5kQW5kQ291bnQoQ2FsZW5kYXIsIHdoZXJlLCB7IHBvcHVsYXRlOiBbJ2NvbGxhYm9yYXRvcnMnLCAncGllY2VzJ119KTtcclxuICAgICAgICAgICAgZm9yIChjb25zdCBjYWxlbmRhciBvZiBjYWxlbmRhcnMpIHtcclxuICAgICAgICAgICAgICAgIGF3YWl0IHBvcHVsYXRlSW1hZ2VzKGNhbGVuZGFyKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBhd2FpdCBvcm0uZW0uZmx1c2goKTtcclxuXHJcbiAgICAgICAgICAgIHNldEdldExpc3RIZWFkZXJzKHJlcywgY291bnQsIGNhbGVuZGFycy5sZW5ndGgpO1xyXG4gICAgICAgICAgICByZXMuc3RhdHVzKDIwMSkuanNvbihjYWxlbmRhcnMpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGxldCBjYWxlbmRhcnM6IExvYWRlZDxDYWxlbmRhciwgbmV2ZXI+W10gPSBbXTtcclxuICAgICAgICAgICAgbGV0IGkgPSAwO1xyXG4gICAgICAgICAgICBkbyB7XHJcbiAgICAgICAgICAgICAgICBjYWxlbmRhcnMgPSBhd2FpdCBvcm0uZW0uZmluZChDYWxlbmRhciwge30sIHsgbGltaXQ6IDIwLCBvZmZzZXQ6IGksIG9yZGVyQnk6IHtpZDogJ0FTQyd9IH0pO1xyXG4gICAgICAgICAgICAgICAgZm9yIChjb25zdCBjYWxlbmRhciBvZiBjYWxlbmRhcnMpIHtcclxuICAgICAgICAgICAgICAgICAgICBhd2FpdCBwb3B1bGF0ZUltYWdlcyhjYWxlbmRhcik7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVXBkYXRlZCAke2NhbGVuZGFycy5sZW5ndGh9IGNhbGVuZGFycycgaW1hZ2VzLmApO1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgb3JtLmVtLmZsdXNoKCk7XHJcbiAgICAgICAgICAgICAgICBpICs9IGNhbGVuZGFycy5sZW5ndGg7XHJcbiAgICAgICAgICAgIH0gd2hpbGUgKGNhbGVuZGFycy5sZW5ndGggIT09IDApO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgVG90YWwgdXBkYXRlZDogJHtpfWApO1xyXG5cclxuICAgICAgICAgICAgc2V0R2V0TGlzdEhlYWRlcnMocmVzLCBpLCBpKTtcclxuICAgICAgICAgICAgcmVzLnN0YXR1cygyMDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgcmVzcG9uZFdpdGhFcnJvcihlLCByZXMpO1xyXG4gICAgfVxyXG59KVxyXG5cclxuZXhwb3J0IGNvbnN0IEFkbWluUmVzdCA9IGFkbWluUmVzdDtcclxuIl0sIm5hbWVzIjpbImRvdGVudiIsImV4cHJlc3MiLCJzdHJpcGVDbGllbnQiLCJjb25maWciLCJvdmVycmlkZSIsImdldFBob3RvcyIsIlZhbGlkYXRpb25FcnJvciIsIndyYXAiLCJvcm0iLCJCaW8iLCJBY2NsYWltIiwiQ2FsZW5kYXIiLCJQaWVjZSIsIkNvbGxhYm9yYXRvciIsIkNhbGVuZGFyQ29sbGFib3JhdG9yIiwiQ2FsZW5kYXJQaWVjZSIsIk11c2ljIiwiTXVzaWNGaWxlIiwiRGlzYyIsIkRpc2NMaW5rIiwiUGhvdG8iLCJVc2VyIiwiUHJvZHVjdCIsIkZhcSIsImdldEltYWdlRnJvbU1ldGFUYWciLCJhZG1pblJlc3QiLCJSb3V0ZXIiLCJ1c2UiLCJqc29uIiwidXJsZW5jb2RlZCIsImV4dGVuZGVkIiwicmVzcG9uZFdpdGhFcnJvciIsImVycm9yIiwicmVzIiwiY29uc29sZSIsInN0YXR1cyIsIm1lc3NhZ2UiLCJtYXBTZWFyY2hGaWVsZHMiLCJlbnRpdHkiLCJzZWFyY2hhYmxlRmllbGRzIiwidG9rZW4iLCJtYXAiLCJmaWVsZCIsIm5hbWUiLCJ0eXBlT2ZGaWVsZCIsImVtIiwiZ2V0TWV0YWRhdGEiLCJnZXQiLCJwcm9wZXJ0aWVzIiwidHlwZSIsIiRpbGlrZSIsIm1pa3JvU2VhcmNoRmllbGRzIiwicG9wdWxhdGUiLCJtYXBwZWRGaWVsZHMiLCJxIiwibGltaXQiLCJ0b2tlbnMiLCJyZXBsYWNlQWxsIiwic3BsaXRUb2tlbnMiLCJzcGxpdCIsInQiLCJ3aGVyZSIsIiRvciIsIiRhbmQiLCJ2IiwicmVzdWx0cyIsImZpbmRBbmRDb3VudCIsInJvd3MiLCJjb3VudCIsIk5vdEZvdW5kRXJyb3IiLCJFcnJvciIsImNvbnN0cnVjdG9yIiwib3JkZXJBcnJheVRvT2JqIiwiYXJyIiwiZW50Iiwib3JkIiwicmV0T2JqIiwicGFyc2VRdWVyeSIsInF1ZXJ5Iiwib3B0aW9ucyIsInJhbmdlIiwic29ydCIsImZpbHRlciIsImZyb20iLCJ0byIsIkpTT04iLCJwYXJzZSIsInVuZGVmaW5lZCIsImZpbHRlcnMiLCJvZmZzZXQiLCJvcmRlciIsInByaW1hcnlLZXlOYW1lIiwic2V0R2V0TGlzdEhlYWRlcnMiLCJ0b3RhbCIsInJvd0NvdW50IiwicmF3VmFsdWUiLCJzZXQiLCJqb2luIiwidG9GaXhlZCIsImNydWQiLCJwYXRoIiwiYWN0aW9ucyIsInJvdXRlciIsImdldExpc3QiLCJyZXEiLCJuZXh0IiwibGVuZ3RoIiwic2VhcmNoIiwiZSIsImdldE9uZSIsInJlY29yZCIsInBhcmFtcyIsImlkIiwiY3JlYXRlIiwicG9zdCIsImJvZHkiLCJ1cGRhdGUiLCJwdXQiLCJkZXN0cm95IiwiZGVsZXRlIiwibWlrcm9DcnVkIiwiY3JlYXRlZCIsInBlcnNpc3QiLCJmbHVzaCIsImZpbmRPbmVPckZhaWwiLCJmYWlsSGFuZGxlciIsImFzc2lnbiIsIm1lcmdlT2JqZWN0cyIsInVwZGF0ZU1hbnkiLCJpZHMiLCJyZWNvcmRzIiwiJGluIiwib3JkZXJCeSIsImdldFJlZmVyZW5jZSIsInJlbW92ZSIsImNhbCIsInBsYWluQ2FsIiwidG9QT0pPIiwiY29sbGFib3JhdG9ycyIsInZhbCIsImlkeCIsInBpZWNlcyIsImNhbHMiLCJwb2pvIiwiXyIsImNhbGVuZGFyUmVzdWx0cyIsImNhbGVuZGFyU2VhcmNoTWF0dmlldyIsIlNlYXJjaCIsIiRmdWxsdGV4dCIsImRhdGVUaW1lIiwiY3JlYXRlQm9keSIsImNhbGVuZGFySWQiLCJjb2xsYWIiLCJyZWYiLCJpbnN0cnVtZW50IiwiY2FsQ29sbGFiIiwiY2FsZW5kYXIiLCJjb2xsYWJvcmF0b3IiLCJwaWVjZSIsImNvbXBvc2VyIiwiY2FsUGllY2UiLCJwcmljZXNBbmRQcm9kdWN0cyIsImdldFByaWNlc0FuZFByb2R1Y3RzIiwiZGF0YSIsInByb2QiLCJwcm9kdWN0SXNPYmplY3QiLCJkZXNjcmlwdGlvbiIsIm1ldGFkYXRhIiwic2FtcGxlIiwicGFnZXMiLCJwZXJtYWxpbmsiLCJmaWxlIiwiaW1hZ2VzIiwiZGVmYXVsdF9wcmljZSIsInByaWNlIiwidW5pdF9hbW91bnQiLCJwYXJzZUludCIsInJlcGxhY2UiLCJUSFVNQk5BSUxfU1RBVElDIiwicHJpY2VJZCIsInByb2R1Y3RzIiwidXBzZXJ0TWFueSIsInBvcHVsYXRlSW1hZ2VzIiwid2Vic2l0ZSIsImltYWdlVXJsIiwibG9jYXRpb24iLCJmZXRjaGVkSW1hZ2VVcmwiLCJ1c2VQbGFjZVBob3RvIiwib3RoZXJDYWwiLCJmaW5kT25lIiwicGhvdG9SZWZlcmVuY2UiLCIkbmUiLCJwbGFjZUlkIiwibG9nIiwiY2FsZW5kYXJzIiwiaSIsImZpbmQiLCJBZG1pblJlc3QiXSwibWFwcGluZ3MiOiJBQUFBLFlBQVlBLFlBQVksU0FBUztBQUNqQyxZQUFZQyxhQUFhLFVBQVU7QUFDbkMsWUFBWUMsa0JBQWtCLGNBQWM7QUFFNUNGLE9BQU9HLE1BQU0sQ0FBQztJQUFFQyxVQUFVO0FBQUs7QUFFL0IsU0FBU0MsU0FBUyxRQUFRLG1CQUFtQjtBQUM3QyxTQUErR0MsZUFBZSxFQUFFQyxJQUFJLFFBQVEsa0JBQWtCO0FBQzlKLE9BQU9DLFNBQVMsZ0JBQWdCO0FBQ2hDLFNBQVNDLEdBQUcsUUFBUSxrQkFBa0I7QUFDdEMsU0FBU0MsT0FBTyxRQUFRLHNCQUFzQjtBQUM5QyxTQUFTQyxRQUFRLFFBQVEsdUJBQXVCO0FBQ2hELFNBQVNDLEtBQUssUUFBUSxvQkFBb0I7QUFDMUMsU0FBU0MsWUFBWSxRQUFRLDJCQUEyQjtBQUN4RCxTQUFTQyxvQkFBb0IsUUFBUSxtQ0FBbUM7QUFFeEUsU0FBU0MsYUFBYSxRQUFRLDRCQUE0QjtBQUMxRCxTQUFTQyxLQUFLLFFBQVEsb0JBQW9CO0FBQzFDLFNBQVNDLFNB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