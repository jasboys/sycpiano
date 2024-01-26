import { Bio } from 'models/Bio.js';
import { crud } from './crud.js';
import { mikroCrud } from './mikroCrud.js';

export const bioHandler = crud('/bios', mikroCrud({ entity: Bio }));
