import { Disc } from 'models/Disc.js';
import { crud } from './crud.js';
import { mikroCrud } from './mikroCrud.js';

export const discHandler = crud(
    '/discs',
    mikroCrud({
        entity: Disc,
        populate: ['discLinks'],
        searchableFields: ['title', 'description'],
    }),
);
