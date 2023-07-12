import * as bodyParser from 'body-parser';
import { Router } from 'express';

import acclaimsHandler from './apis/acclaims.js';
import bioHandler from './apis/bio.js';
import calendarRouter from './apis/calendar.js';
import discHandler from './apis/disc.js';
import musicHandler from './apis/music.js';
import photosHandler from './apis/photos.js';
import shopHandler from './apis/shop.js';

const apiRouter = Router();
// Since webhooks need to use raw body, don't use bodyParser before
apiRouter.use('/shop', shopHandler);

apiRouter.use(bodyParser.json());
apiRouter.get('/bio', bioHandler);
apiRouter.get('/acclaims', acclaimsHandler);
apiRouter.use(/\/calendar/, calendarRouter);
apiRouter.get('/music', musicHandler);
apiRouter.get('/photos', photosHandler);
apiRouter.get('/discs', discHandler);

export const ApiRouter = apiRouter;
