import { EntityData } from '@mikro-orm/core';
import orm from 'database.js';
import { Calendar } from 'models/Calendar.js';
import { CalendarPiece } from 'models/CalendarPiece.js';
import { Piece } from 'models/Piece.js';
import { crud } from './crud.js';
import { mikroCrud } from './mikroCrud.js';
import { NotFoundError } from './types.js';

interface CalendarPieceCreate extends EntityData<CalendarPiece> {
    ref?: string;
    composer: string;
    piece: string;
    order: number;
    calendarId: string;
}

export const calendarPieceHandler = crud('/calendar-pieces', {
    ...mikroCrud({ entity: CalendarPiece, searchableFields: ['piece'] }),
    create: async (body) => {
        const createBody = body as CalendarPieceCreate;
        const cal = await orm.em.findOneOrFail(Calendar, {
            id: createBody.calendarId,
        });
        const piece =
            createBody.id ??
            orm.em.create(Piece, {
                piece: createBody.piece,
                composer: createBody.composer,
            });

        const calPiece = orm.em.create(CalendarPiece, {
            calendar: cal,
            piece,
            order: createBody.order,
        });

        if (typeof piece !== 'string') {
            orm.em.persist(piece);
        }
        orm.em.persist(calPiece);
        await orm.em.flush();

        return {
            ...calPiece,
            id: cal.id,
        };
    },
    update: async (id, body) => {
        const record = await orm.em.findOneOrFail(
            CalendarPiece,
            { id },
            { failHandler: () => new NotFoundError() },
        );
        if (!!body.composer || !!body.piece) {
            const piece = await orm.em.findOneOrFail(Piece, {
                id: body.pieceId,
            });
            piece.piece = body.pieceName;
            piece.composer = body.composer;
        }
        if (body.order !== null) {
            record.order = body.order;
        }
        await orm.em.flush();
        return record;
    },
    destroy: async (id) => {
        const calPiece = await orm.em.findOneOrFail(CalendarPiece, { id });
        orm.em.remove(calPiece);
        await orm.em.flush();
        return { id };
    },
});
