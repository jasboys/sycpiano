import { Router, json } from 'express';

import acclaimsHandler from './acclaims.js';
import bioHandler from './bio.js';
import calendarRouter from './calendar.js';
import discHandler from './disc.js';
import musicHandler from './music.js';
import photosHandler from './photos.js';
import shopHandler from './shop.js';

const apiRouter = Router();
// Since webhooks need to use raw body, don't use bodyParser before
apiRouter.use('/shop', shopHandler);

apiRouter.use(json());
apiRouter.get('/bio', bioHandler);
apiRouter.get('/acclaims', acclaimsHandler);
apiRouter.use(/\/calendar/, calendarRouter);
apiRouter.get('/music', musicHandler);
apiRouter.get('/photos', photosHandler);
apiRouter.get('/discs', discHandler);

export const ApiRouter = apiRouter;
