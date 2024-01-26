import { DiscLink } from '../models/DiscLink.js';
import { crud } from './crud.js';
import { mikroCrud } from './mikroCrud.js';

export const discLinkHandler = crud(
    '/disc-links',
    mikroCrud({ entity: DiscLink }),
);
