import { Program } from '../models/Program.js';
import { crud } from './crud.js';
import { mikroCrud } from './mikroCrud.js';

export const programHandler = crud(
    '/programs',
    mikroCrud({
        entity: Program,
        populate: ['pieces', 'programPieces'],
        searchableFields: ['nickname'],
    }),
);
