import { NextFunction, Request, Response } from 'express';
import orm from '../database.js';
import { Photo } from '../models/Photo.js';
import { QueryOrder } from '@mikro-orm/core';

const photosHandler = async (
    _: Request,
    res: Response,
    __: NextFunction,
): Promise<void> => {
    const response = await orm.em.find(
        Photo,
        {
            $or: [
                {
                    omitFromGallery: { $eq: null },
                },
                {
                    omitFromGallery: { $ne: true },
                },
            ],
        },
        { orderBy: { dateTaken: QueryOrder.DESC_NULLS_LAST } },
    );
    res.json(response);
};

export default photosHandler;
