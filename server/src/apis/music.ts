import { Request, Response, NextFunction } from 'express';
import Sequelize from 'sequelize';

import db from '../models';
const models = db.models;

const getMusicInstancesOfType = (type: string) => {
    const order = (type === 'videogame' || type === 'composition') ?
        [
            ['year', 'DESC'],
            [models.musicFile, 'name', 'ASC'],
        ] :
        [
            [Sequelize.fn('substring', Sequelize.col('composer'), '([^\\s]+)\\s?(?:\\(.*\\))?$'), 'ASC'] as any,
            [models.musicFile, 'name', 'ASC'],
        ];

    return models.music.findAll({
        where: {
            type,
        },
        attributes: {
            exclude: ['created_at', 'updated_at', 'createdAt', 'updatedAt'],
        },
        include: [{
            model: models.musicFile,
            attributes: {
                exclude: ['created_at', 'updated_at', 'createdAt', 'updatedAt'],
            },
        }],
        order,
    });
};

const musicHandler = async (_: Request, res: Response, __: NextFunction): Promise<void> => {
    const [solo, concerto, chamber, composition, videogame] = await Promise.all([
        getMusicInstancesOfType('solo'),
        getMusicInstancesOfType('concerto'),
        getMusicInstancesOfType('chamber'),
        getMusicInstancesOfType('composition'),
        getMusicInstancesOfType('videogame'),
    ]);

    res.json({ solo, concerto, chamber, composition, videogame });
};

export default musicHandler;
