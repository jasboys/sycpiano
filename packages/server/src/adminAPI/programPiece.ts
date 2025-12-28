import type { EntityData } from '@mikro-orm/core';
import orm from '../database.js';
import { Piece } from '../models/Piece.js';
import { Program } from '../models/Program.js';
import { ProgramPiece } from '../models/ProgramPiece.js';
import { crud } from './crud.js';
import { mikroCrud } from './mikroCrud.js';
import { NotFoundError } from './types.js';

interface ProgramPieceCreate extends EntityData<ProgramPiece> {
    ref?: string;
    composer: string;
    piece: string;
    order: number;
    programId: string;
}

export const programPieceHandler = crud('/program-pieces', {
    ...mikroCrud({ entity: ProgramPiece, searchableFields: ['piece'] }),
    create: async (body) => {
        const createBody = body as ProgramPieceCreate;
        const prog = await orm.em.findOneOrFail(Program, {
            id: createBody.programId,
        });
        const piece =
            createBody.id ??
            orm.em.create(Piece, {
                piece: createBody.piece,
                composer: createBody.composer,
            });

        const programPiece = orm.em.create(ProgramPiece, {
            program: prog,
            piece,
            order: createBody.order,
        });

        if (typeof piece !== 'string') {
            orm.em.persist(piece);
        }
        orm.em.persist(programPiece);
        await orm.em.flush();

        return {
            ...programPiece,
            id: prog.id,
        };
    },
    update: async (id, body) => {
        const record = await orm.em.findOneOrFail(
            ProgramPiece,
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
        const programPiece = await orm.em.findOneOrFail(ProgramPiece, { id });
        orm.em.remove(programPiece);
        await orm.em.flush();
        return { id };
    },
});
