import { Acclaim } from 'models/Acclaim.js';
import { crud } from './crud.js';
import { mikroCrud } from './mikroCrud.js';

export const acclaimHandler = crud('/acclaims', mikroCrud({ entity: Acclaim }));
