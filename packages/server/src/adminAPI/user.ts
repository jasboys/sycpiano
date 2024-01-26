import { User } from 'models/User.js';
import { crud } from './crud.js';
import { mikroCrud } from './mikroCrud.js';

export const userHandler = crud(
    '/users',
    mikroCrud({
        entity: User,
        populate: ['products'],
        searchableFields: ['username'],
    }),
);
