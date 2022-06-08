import { Request, Response, NextFunction } from 'express';
import * as Sequelize from 'sequelize';

import db from '../models';
const models = db.models;

interface RequestWithCount extends Request {
    params: {
        count: string;
    };
}

const getAcclaims = async (req: RequestWithCount, res: Response, _: NextFunction): Promise<void> => {
    const params: Sequelize.FindOptions = {
        attributes: {
            exclude: ['short', 'shortAuthor', 'created_at', 'updated_at'],
        },
        order: [
            ['date', 'DESC'],
        ],
    };
    if (Object.prototype.hasOwnProperty.call(req.params, 'count')) {
        params.limit = parseInt(req.params.count);
    }
    const acclaims = await models.acclaim.findAll(params);
    res.json(acclaims);
};

export default getAcclaims;
