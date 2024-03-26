import { QueryOrder } from '@mikro-orm/core';
import type { NextFunction, Request, Response } from 'express';

import orm from '../database.js';
import { Acclaim } from '../models/Acclaim.js';

interface RequestWithCount extends Request {
    params: {
        count?: string;
    };
}

const getAcclaims = async (
    req: RequestWithCount,
    res: Response,
    _: NextFunction,
): Promise<void> => {
    const limit = req.params.count
        ? Number.parseInt(req.params.count)
        : undefined;
    const acclaims = await orm.em.find(
        Acclaim,
        {},
        { limit, orderBy: [{ date: QueryOrder.DESC }] },
    );
    res.json(acclaims);
};

export default getAcclaims;
