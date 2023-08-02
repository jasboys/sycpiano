import { NextFunction, Request, Response } from 'express';
import orm from '../database.js';
import { Photo } from '../models/Photo.js';

const photosHandler = async (
    _: Request,
    res: Response,
    __: NextFunction,
): Promise<void> => {
    const response = await orm.em.find(Photo, {});
    res.json(response);
};

export default photosHandler;
