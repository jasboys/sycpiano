import * as Promise from 'bluebird';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as express from 'express';
import * as forest from 'forest-express-sequelize';
import * as path from 'path';
import * as Sequelize from 'sequelize';
import * as stripeClient from './stripe';
import crud, { Actions } from 'express-sequelize-crud';

dotenv.config();

import {
    createCalendarEvent,
    getCalendarSingleEvent,
    updateCalendar
} from './gapi/calendar';
import db from './models';

const models = db.models;

import { calendar } from './models/calendar';
import { ActionsRouter } from './actions';
import { isObject, transform } from 'lodash';
import { Model, ModelCtor } from './types';

const adminRest = express.Router();

adminRest.use(express.json());
adminRest.use(express.urlencoded({ extended: true }));

let allowedOrigins: Array<RegExp | string> = [/localhost:\d{4}$/];
if (process.env.CORS_ORIGINS) {
    allowedOrigins = allowedOrigins.concat(process.env.CORS_ORIGINS.split(','));
}

const corsOptions: cors.CorsOptions = {
    origin: allowedOrigins,
    allowedHeaders: ['Authorization', 'X-Requested-With', 'Content-Type', 'X-Total-Count'],
    optionsSuccessStatus: 204,
    maxAge: 86400,
    credentials: true,
};

adminRest.use(cors(corsOptions));

export const respondWithError = (error: Sequelize.ValidationError | string, res: express.Response): void => {
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

const sequelizeCrud = <I extends string | number>(
    model: ModelCtor<any>,
): Omit<Actions<I, Model>, 'search'> => {
    const _model: ModelCtor<any> = model // TODO: how to correctly type this???
    return {
        create: async body => _model.create(body),
        update: async (id, body) => {
            const record = await _model.findByPk(id, {
                attributes: {
                    exclude: EXCLUDE_TIMESTAMPS,
                },
            });
            if (!record) {
                throw new Error('Record not found')
            }
            return record.update(body)
        },
        getOne: async id => _model.findByPk(id, {
            attributes: {
                exclude: EXCLUDE_TIMESTAMPS,
            },
        }),
        getList: async ({ filter, limit, offset, order }) => {
            return _model.findAndCountAll({
                attributes: {
                    exclude: EXCLUDE_TIMESTAMPS,
                },

                limit,
                offset,
                order,
                where: filter,
                raw: true,
            })
        },
        destroy: async id => {
            const record = await _model.findByPk(id)
            if (!record) {
                throw new Error('Record not found')
            }
            await record.destroy()
            return { id }
        },
    }
}

adminRest.use(crud('/bios', {
    ...sequelizeCrud(models.bio),
    getList: async ({ filter, limit, offset, order }) => {
        const transformedOrder: Sequelize.Order = order.map(([field, dir]) => {
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
            exclude: ['id', 'created_at', 'updated_at', 'createdAt', 'updatedAt', 'calendarCollaborators', '_search'],
        },
        through: {
            attributes: ['order'],
        },
    },
    {
        model: models.piece,
        attributes: {
            exclude: ['id', 'created_at', 'updated_at', 'createdAt', 'updatedAt', 'calendarPieces', '_search'],
        },
        through: {
            attributes: ['order'],
        },
    },
];

adminRest.use(crud('/acclaims', sequelizeCrud(models.acclaim)));
adminRest.use(crud('/calendars', {
    ...sequelizeCrud(models.calendar),
    getOne: async id => models.calendar.findByPk(id, {
        attributes: {
            exclude: ['created_at', 'updated_at', 'createdAt', 'updatedAt'],
        },
        include: calendarIncludeBase,
    }),
    getList: async ({ filter, limit, offset, order }) => {
        return models.calendar.findAndCountAll({
            attributes: {
                exclude: ['created_at', 'updated_at', 'createdAt', 'updatedAt'],
            },
            include: calendarIncludeBase,
            limit,
            offset,
            order,
            where: filter,
        });
    },
}));

adminRest.use(crud('/pieces', sequelizeCrud(models.piece)));
adminRest.use(crud('/collaborators', sequelizeCrud(models.collaborator)));
adminRest.use(crud('/calendar-collaborators', sequelizeCrud(models.calendarCollaborator)));
adminRest.use(crud('/calendar-pieces', sequelizeCrud(models.calendarPiece)));

adminRest.use(crud('/musics', {
    ...sequelizeCrud(models.music),
    getOne: async id => models.music.findByPk(id, {
        include: [{
            model: models.musicFile,
            attributes: {
                exclude: ['created_at', 'updated_at', 'createdAt', 'updatedAt'],
            },
        }],
    }),
    getList: async ({ filter, limit, offset, order }) => {
        return models.music.findAndCountAll({
            attributes: {
                exclude: ['created_at', 'updated_at', 'createdAt', 'updatedAt'],
            },
            include: [{
                model: models.musicFile,
                attributes: {
                    exclude: ['created_at', 'updated_at', 'createdAt', 'updatedAt'],
                },
            }],
            limit,
            offset,
            order,
            where: filter,
        });
    },
}));


adminRest.use(crud('/music-files', sequelizeCrud(models.musicFile)));
adminRest.use(crud('/discs', sequelizeCrud(models.disc)));
adminRest.use(crud('/disc-links', sequelizeCrud(models.discLink)));
adminRest.use(crud('/photos', sequelizeCrud(models.photo)));
adminRest.use(crud('/customers', sequelizeCrud(models.customer)));
adminRest.use(crud('/products', sequelizeCrud(models.product)));
adminRest.use(crud('/faqs', sequelizeCrud(models.faq)));

export const AdminRest = adminRest;
