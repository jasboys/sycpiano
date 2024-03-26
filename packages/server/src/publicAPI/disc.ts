import type { NextFunction, Request, Response } from 'express';
import orm from '../database.js';
import { Disc } from '../models/Disc.js';

const discHandler = async (
    _: Request,
    res: Response,
    __: NextFunction,
): Promise<void> => {
    const response = await orm.em.find(
        Disc,
        {},
        {
            populate: ['discLinks'],
            orderBy: { releaseDate: 'DESC' },
        },
    );
    res.json(response);
};

export default discHandler;
