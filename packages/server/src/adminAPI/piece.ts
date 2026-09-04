import orm from '../database.js';
import { CalendarPiece } from '../models/CalendarPiece.js';
import { Piece } from '../models/Piece.js';
import { crud, setGetListHeaders } from './crud.js';
import { respondWithError } from './index.js';
import { mikroCrud } from './mikroCrud.js';

const pieceRouter = crud('/pieces', {
    ...mikroCrud({
        entity: Piece,
        populate: ['calendars'],
        searchableFields: ['composer', 'piece'],
    }),
});

pieceRouter.post('/actions/pieces/merge-into/:id', async (req, res) => {
    const pieceId = req.params.id;
    try {
        const piece = await orm.em.transactional(async (forkedEm) => {
            const piece = await forkedEm.findOneOrFail(Piece, pieceId);
            const allMatchingPieces = await forkedEm.find(
                Piece,
                {
                    $and: [
                        { piece: piece.piece },
                        { composer: piece.composer },
                    ],
                },
                { populate: ['calendarPieces'] },
            );
            const otherPieces = allMatchingPieces.filter(
                (p) => p.id !== pieceId,
            );
            for (const p of otherPieces) {
                const cps = p.calendarPieces;
                for (const cp of cps) {
                    const order = cp.order;
                    const calendar = cp.calendar;
                    forkedEm.remove(cp);
                    forkedEm.create(CalendarPiece, {
                        calendar,
                        piece,
                        order,
                    });
                }
            }
            return piece;
        });

        res.json(piece);
    } catch (e) {
        respondWithError(e as Error, res);
    }
});

pieceRouter.post('/actions/pieces/merge', async (req, res) => {
    const pieceIds = req.body.ids as string[];
    try {
        const piece = await orm.em.transactional(async (forkedEm) => {
            const pieces = await forkedEm.find(
                Piece,
                { id: pieceIds },
                { populate: ['calendarPieces'], orderBy: { id: 'ASC' } },
            );
            const [piece, ...otherPieces] = pieces;
            for (const p of otherPieces) {
                const cps = p.calendarPieces;
                for (const cp of cps) {
                    const order = cp.order;
                    const calendar = cp.calendar;
                    forkedEm.remove(cp);
                    forkedEm.create(CalendarPiece, {
                        calendar,
                        piece,
                        order,
                    });
                }
            }
            return piece;
        });

        res.json(piece);
    } catch (e) {
        respondWithError(e as Error, res);
    }
});

pieceRouter.post('/actions/pieces/trim', async (_req, res) => {
    const { pieces, count } = await orm.em.transactional(async (forkedEm) => {
        const [pieces, count] = await forkedEm.findAndCount(Piece, {
            $or: [{ composer: /^ .*/i }, { piece: /^ .*/i }],
        });
        for (const p of pieces) {
            p.composer = p.composer?.trim();
            p.piece = p.piece?.trim();
        }
        return { pieces, count };
    });

    setGetListHeaders(res, count, pieces.length);
    res.json({ count, rows: pieces });
});

export const pieceHandler = pieceRouter;
