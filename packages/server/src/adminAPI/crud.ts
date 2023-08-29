import { QueryOrderMap, Primary, NotFoundError } from '@mikro-orm/core';
import express from 'express';
import QueryString from 'qs';
import { CrudActions, FilterOptions } from './types.js';

const orderArrayToObj = <R extends object, K extends keyof QueryOrderMap<R>>(
    arr: [K, string][],
): QueryOrderMap<R>[] =>
    arr.map(([ent, ord]) => {
        const retObj: QueryOrderMap<R> = {};
        retObj[ent] = ord;
        return retObj;
    });

type Filter = Record<string, unknown> & {
    q: string;
};

const parseQuery = <R extends object, Q extends QueryString.ParsedQs>(
    query: Q,
    options?: FilterOptions<R>,
) => {
    const range = query.range as string | undefined;
    const sort = query.sort as string | undefined;
    const filter = query.filter as string | object;
    const [from, to] = range ? JSON.parse(range) : [undefined, undefined];

    console.log(filter, typeof filter);
    const { q, ...filters }: Filter =
        typeof filter === 'string' ? JSON.parse(filter) : filter;
    console.log('filters', filters);

    return {
        offset: from as number,
        limit: to ? to - (from ?? 0) + 1 : undefined,
        filter: {
            ...options?.filters,
            ...filters,
        },
        order: sort
            ? orderArrayToObj(JSON.parse(sort))
            : [{ [options?.primaryKeyName ?? 'id']: 'ASC' }],
        q,
    };
};

export const setGetListHeaders = (
    res: express.Response,
    total: number,
    rowCount: number,
    offset = 1,
) => {
    const rawValue = res.get('Access-Control-Expose-Headers') || '';
    if (typeof rawValue !== 'string') {
        return;
    }
    res.set(
        'Access-Control-Expose-Headers',
        [rawValue, 'Content-Range', 'X-Total-Count'].join(','),
    );
    res.set(
        'Content-Range',
        `${offset.toFixed(0)}-${(offset + rowCount).toFixed(0)}/${total.toFixed(
            0,
        )}`,
    );
    res.set('X-Total-Count', `${total.toFixed(0)}`);
};

export const crud = <I extends NonNullable<Primary<R>>, R extends object>(
    path: string,
    actions: CrudActions<I, R>,
    options?: FilterOptions<R>,
) => {
    const router = express.Router();
    if (actions.getList) {
        router.get(path, async (req, res, next) => {
            try {
                const { q, limit, offset, filter, order } = parseQuery(
                    req.query,
                    options,
                );
                if (!q) {
                    if (actions.getList) {
                        const { rows, count } = await actions.getList(
                            { filter, limit, offset, order },
                            { req, res },
                        );
                        setGetListHeaders(res, count, rows.length, offset);
                        res.json(rows);
                    } else {
                        throw Error('Not Implemented');
                    }
                } else {
                    if (actions.search) {
                        const { rows, count } = await actions.search(
                            { q, limit },
                            { req, res },
                        );
                        setGetListHeaders(res, count, rows.length, offset);
                        res.json(rows);
                    } else {
                        throw Error('Not Implemented');
                    }
                }
            } catch (e) {
                next(e);
            }
        });
    }

    if (actions.getOne) {
        router.get(`${path}/:id`, async (req, res, next) => {
            try {
                if (actions.getOne) {
                    const record = await actions.getOne(req.params.id as I, {
                        req,
                        res,
                    });
                    res.json(record);
                } else {
                    throw Error('Not Implemented');
                }
            } catch (e) {
                if (e instanceof NotFoundError) {
                    return res.status(404).json({
                        error: 'Record not found',
                    });
                } else {
                    next(e);
                }
            }
        });
    }

    if (actions.create) {
        router.post(path, async (req, res, next) => {
            try {
                if (actions.create) {
                    const record = await actions.create(req.body, { req, res });
                    res.status(201).json(record);
                } else {
                    throw Error('Not Implemented');
                }
            } catch (error) {
                next(error);
            }
        });
    }

    if (actions.update) {
        router.put(`${path}/:id`, async (req, res, next) => {
            try {
                if (actions.update) {
                    const record = await actions.update(
                        req.params.id as I,
                        req.body,
                        {
                            req,
                            res,
                        },
                    );
                    res.json(record);
                } else {
                    throw Error('Not Implemented');
                }
            } catch (e) {
                if (e instanceof NotFoundError) {
                    return res.status(404).json({
                        error: 'Record not found',
                    });
                } else {
                    next(e);
                }
            }
        });
    }

    if (actions.destroy) {
        router.delete(`${path}/:id`, async (req, res, next) => {
            try {
                if (actions.destroy) {
                    const id = await actions.destroy(req.params.id as I, {
                        req,
                        res,
                    });
                    res.json({
                        id,
                    });
                } else {
                    throw Error('Not Implemented');
                }
            } catch (e) {
                if (e instanceof NotFoundError) {
                    return res.status(404).json({
                        error: 'Record not found',
                    });
                } else {
                    next(e);
                }
            }
        });
    }

    return router;
};
