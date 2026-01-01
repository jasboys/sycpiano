import * as dotenv from 'dotenv';
import * as express from 'express';

dotenv.config({ override: true });

import { ValidationError } from '@mikro-orm/core';
import { csrfMiddleware } from '../csrf.js';
import { acclaimHandler } from './acclaim.js';
import { bioHandler } from './bio.js';
import { calendarHandler } from './calendar.js';
import { calendarCollaboratorHandler } from './calendarCollaborator.js';
import { calendarPieceHandler } from './calendarPiece.js';
import { collaboratorHandler } from './collaborator.js';
import { discHandler } from './disc.js';
import { discLinkHandler } from './discLink.js';
import { faqHandler } from './faq.js';
import { musicHandler } from './music.js';
import { musicFileHandler } from './musicFile.js';
import { photoHandler } from './photo.js';
import { pieceHandler } from './piece.js';
import { productHandler } from './product.js';
import { programHandler } from './program.js';
import { programPieceHandler } from './programPiece.js';
import { userHandler } from './user.js';

const adminRest = express.Router();
adminRest.use(express.json());
adminRest.use(express.urlencoded({ extended: true }));
adminRest.post('*splat', csrfMiddleware);

export const respondWithError = (error: Error, res: express.Response): void => {
    if (error instanceof ValidationError) {
        res.status(400).json({
            error: (error as ValidationError).message,
        });
    } else {
        res.status(400).json({
            error,
        });
    }
};

export interface RequestWithBody extends express.Request {
    body: {
        data: {
            attributes: {
                ids: string[];
            };
        };
    };
}

adminRest.use(bioHandler);
adminRest.use(acclaimHandler);
adminRest.use(calendarHandler);
adminRest.use(pieceHandler);
adminRest.use(collaboratorHandler);
adminRest.use(calendarCollaboratorHandler);
adminRest.use(calendarPieceHandler);
adminRest.use(musicHandler);
adminRest.use(musicFileHandler);
adminRest.use(photoHandler);
adminRest.use(discHandler);
adminRest.use(discLinkHandler);
adminRest.use(userHandler);
adminRest.use(productHandler);
adminRest.use(faqHandler);
adminRest.use(programHandler);
adminRest.use(programPieceHandler);

export const AdminRest = adminRest;
