import { Music } from 'models/Music.js';
import { crud } from './crud.js';
import { mikroCrud } from './mikroCrud.js';

export const musicHandler = crud(
    '/musics',
    mikroCrud({
        entity: Music,
        populate: ['musicFiles'],
        searchableFields: ['composer', 'piece', 'contributors', 'type'],
    }),
);
