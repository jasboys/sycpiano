import * as dotenv from 'dotenv';
import * as express from 'express';
import multer from 'multer';
import * as stripeClient from '../stripe.js';

dotenv.config({ override: true });

import {
    EntityData,
    FilterQuery,
    Loaded,
    ValidationError,
    expr,
    wrap,
} from '@mikro-orm/core';
import { format } from 'date-fns';
import { statSync } from 'fs';
import { parse, resolve } from 'path';
import { csrfMiddleware } from '../csrf.js';
import orm from '../database.js';
import { getImageFromMetaTag } from '../gapi/calendar.js';
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
import { genThumbnail, getDateTaken } from './genThumbnail.js';
import { genWaveformAndReturnDuration } from './genWaveform.js';
import { mikroCrud } from './mikroCrud.js';
import { NotFoundError } from './types.js';

const adminRest = express.Router();
adminRest.use(express.json());
adminRest.use(express.urlencoded({ extended: true }));
adminRest.post('*', csrfMiddleware);

export const respondWithError = (error: Error, res: express.Response): void => {
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
                    populate: ['collaborators', 'pieces'],
                },
            );
            const plainCal = wrap(cal).toPOJO();
            return {
                ...plainCal,
                collaborators: plainCal.collaborators.map((val, idx) => {
                    return {
                        ...val,
                        order: idx,
                    };
                }),
                pieces: plainCal.pieces.map((val, idx) => {
                    return {
                        ...val,
                        order: idx,
                    };
                }),
            };
        },
        getList: async ({ filter, limit, offset, order }) => {
            const cals = await orm.em.findAndCount(Calendar, filter, {
                limit,
                offset,
                orderBy: order,
                populate: ['collaborators', 'pieces'],
            });

            return {
                count: cals[1],
                rows: cals[0].map((cal) => {
                    const pojo = wrap(cal).toPOJO();
                    return {
                        ...pojo,
                        // dateTime: transformDateTime(cal.dateTime, cal.timezone),
                        collaborators: pojo.collaborators.map((val, idx) => {
                            return {
                                ...val,
                                order: idx,
                            };
                        }),
                        pieces: pojo.pieces.map((val, idx) => {
                            return {
                                ...val,
                                order: idx,
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
                populate: ['collaborators', 'pieces'],
                orderBy: [{ dateTime: 'DESC' }],
                limit,
            });
            return {
                count: calendarResults[1],
                rows: calendarResults[0].map((cal) => {
                    const pojo = wrap(cal).toPOJO();
                    return {
                        ...pojo,
                        // dateTime: transformDateTime(cal.dateTime, cal.timezone),
                        collaborators: pojo.collaborators.map((val, idx) => {
                            return {
                                ...val,
                                order: idx,
                            };
                        }),
                        pieces: pojo.pieces.map((val, idx) => {
                            return {
                                ...val,
                                order: idx,
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
            const matchArray = q.trim().match(/^id\:(.*)$/i);
            let where: FilterQuery<Piece>;
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

                where = {
                    [expr(`immutable_concat_ws(' ', composer, piece)`)]: {
                        $re: regexPattern,
                    },
                };
            }

            const [rows, count] = await orm.em.findAndCount(Piece, where, {
                populate: ['calendars'],
                limit,
            });
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
            const matchArray = q.trim().match(/^id\:(.*)$/i);
            let where: FilterQuery<Collaborator>;
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

                where = {
                    [expr(`immutable_concat_ws(' ', "name", instrument)`)]: {
                        $re: regexPattern,
                    },
                };
            }

            const [rows, count] = await orm.em.findAndCount(
                Collaborator,
                where,
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

const musicStorage = multer.diskStorage({
    destination: resolve(process.env.MUSIC_ASSETS_DIR),
    filename: (req, _file, cb) => {
        const fileName = req.body.fileName;
        const exists = statSync(
            resolve(process.env.MUSIC_ASSETS_DIR, fileName),
            {
                throwIfNoEntry: false,
            },
        );
        if (exists === undefined) {
            cb(null, req.body.fileName);
        } else {
            cb(Error('File already exists'), '');
        }
    },
});

const photoStorage = multer.diskStorage({
    destination: resolve(process.env.IMAGE_ASSETS_DIR, 'gallery'),
    filename: (req, _file, cb) => {
        const fileName = req.body.fileName;
        const exists = statSync(
            resolve(process.env.IMAGE_ASSETS_DIR, 'gallery', fileName),
            {
                throwIfNoEntry: false,
            },
        );
        if (exists === undefined) {
            cb(null, req.body.fileName);
        } else {
            cb(Error('File already exists'), '');
        }
    },
});

const musicFileUpload = multer({ storage: musicStorage });

adminRest.post(
    '/music-files/upload',
    musicFileUpload.single('audioFile'),
    async (req, res) => {
        try {
            const duration = await genWaveformAndReturnDuration(
                req.body.fileName,
            );

            res.json({ fileName: req.body.fileName, duration });
        } catch (e) {
            res.statusMessage = 'Error generating waveform';
            res.sendStatus(500);
        }
    },
);

const photoUpload = multer({ storage: photoStorage });
adminRest.post(
    '/photos/upload',
    photoUpload.single('photo'),
    async (req, res) => {
        try {
            const imageData = await genThumbnail(req.body.fileName);
            res.json({ fileName: req.body.fileName, ...imageData });
        } catch (e) {
            res.statusMessage = 'Error generating thumbnail';
            res.sendStatus(500);
        }
    },
);

adminRest.use(
    crud(
        '/music-files',
        mikroCrud({
            entity: MusicFile,
            searchableFields: ['audioFile', 'name'],
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
    crud(
        '/users',
        mikroCrud({
            entity: User,
            populate: ['products'],
            searchableFields: ['username'],
        }),
    ),
);

const productStorage = multer.diskStorage({
    destination: (_req, file, cb) => {
        let dest: string;
        if (file.fieldname === 'pdf') {
            dest = resolve(process.env.PRODUCTS_DIR);
        } else {
            dest = resolve(
                process.env.IMAGE_ASSETS_DIR,
                'products',
                'thumbnails',
            );
        }
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        if (file.fieldname === 'pdf') {
            const { name, ext } = parse(req.body.fileName.replace(/ /g, '_'));
            const exists = statSync(
                resolve(process.env.PRODUCTS_DIR, `${name}${ext}`),
                {
                    throwIfNoEntry: false,
                },
            );
            if (exists === undefined) {
                cb(null, `${name}${ext}`);
            } else {
                cb(null, `${name}_${format(new Date(), 'yyyyMMdd')}${ext}`);
            }
        } else {
            let fileName = req.body.imageBaseNameWithExt.replace(/ /g, '_');
            const { name, ext } = parse(fileName);
            let count = 1;
            while (
                statSync(
                    resolve(
                        process.env.IMAGE_ASSETS_DIR,
                        'products',
                        'thumbnails',
                        fileName,
                    ),
                    {
                        throwIfNoEntry: false,
                    },
                )
            ) {
                fileName = `${name}${
                    count ? `_${count.toString().padStart(2, '0')}` : ''
                }${ext}`;
                count++;
            }
            cb(null, fileName);
        }
    },
});

const productUpload = multer({ storage: productStorage });

adminRest.post(
    '/products/upload',
    productUpload.fields([{ name: 'samples[]' }, { name: 'pdf', maxCount: 1 }]),
    async (req, res) => {
        if (Array.isArray(req.files)) {
            throw Error('unexpected array');
        } else {
            res.json({
                images: req.files?.['samples[]']?.map((f) => f.filename),
                pdf: req.files?.pdf?.[0].filename,
            });
        }
    },
);

adminRest.use(
    crud(
        '/products',
        mikroCrud({
            entity: Product,
            searchableFields: ['name', 'file', 'type'],
        }),
    ),
);
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

adminRest.post('/actions/pieces/trim', async (_req, res) => {
    const [pieces, count] = await orm.em.findAndCount(Piece, {
        $or: [{ composer: /^ .*/i }, { piece: /^ .*/i }],
    });
    for (const p of pieces) {
        p.composer = p.composer?.trim();
        p.piece = p.piece?.trim();
    }
    await orm.em.flush();
    setGetListHeaders(res, count, pieces.length);
    res.json({ count, rows: pieces });
});

adminRest.post('/actions/collaborators/trim', async (_req, res) => {
    const [collaborators, count] = await orm.em.findAndCount(Collaborator, {
        $or: [{ name: /^ .*/i }, { instrument: /^ .*/i }],
    });
    for (const p of collaborators) {
        p.name = p.name?.trim();
        p.instrument = p.instrument?.trim();
    }
    await orm.em.flush();
    setGetListHeaders(res, count, collaborators.length);
    res.json({ count, rows: collaborators });
});

adminRest.post('/actions/photos/populate-date-taken', async (_req, res) => {
    const [photos, count] = await orm.em.findAndCount(Photo, {
        dateTaken: { $eq: null },
    });
    for (const p of photos) {
        const dateTaken = p.file ? await getDateTaken(p.file) : undefined;
        p.dateTaken = dateTaken;
    }
    await orm.em.flush();
    setGetListHeaders(res, count, photos.length);
    res.json({ count, rows: photos });
});

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
