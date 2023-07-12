import { QueryOrder } from '@mikro-orm/core';
import { NextFunction, Request, Response } from 'express';

import { getAge } from '../../../common/src/common.js';
import orm from '../database.js';
import { Bio } from '../models/Bio.js';

const getBio = async (_: Request, res: Response, __: NextFunction): Promise<void> => {
    const bio = await orm.em.find(Bio, {}, { orderBy: [{ paragraph: QueryOrder.ASC }] });

    const age = getAge();

    const [firstOrig, ...rest] = bio;
    const first = { paragraph: firstOrig.paragraph, text: firstOrig.text.replace('##', age.toString()) };
    const bioWithAge = [first, ...rest];
    res.json(bioWithAge);
};

export default getBio;
