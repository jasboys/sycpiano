import { differenceInCalendarYears } from 'date-fns';
import { Response, Request, NextFunction } from 'express';

import db from '../models';
const models = db.models;

const getBio = async (_: Request, res: Response, __: NextFunction): Promise<void> => {
    const bio = await models.bio.findAll({
        attributes: ['paragraph', 'text'],
        order: [['paragraph', 'ASC']],
    });

    const age = differenceInCalendarYears(new Date(), new Date(1988, 7, 27));


    const [, ...rest] = bio;
    const first = { paragraph: bio[0].paragraph, text: bio[0].text.replace('##', age.toString()) };
    const bioWithAge = [first, ...rest];
    res.json(bioWithAge);
};

export default getBio;
