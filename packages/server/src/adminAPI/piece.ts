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
        const piece = await orm.em.findOneOrFail(Piece, pieceId);
        const allMatchingPieces = await orm.em.find(
            Piece,
            { $and: [{ piece: piece.piece }, { composer: piece.composer }] },
            { populate: ['calendarPieces'] },
        );
        const otherPieces = allMatchingPieces.filter((p) => p.id !== pieceId);
        for (const p of otherPieces) {
            const cps = p.calendarPieces;
            for (const cp of cps) {
                const order = cp.order;
                const calendar = cp.calendar;
                orm.em.remove(cp);
                const newCp = orm.em.create(CalendarPiece, {
                    calendar,
                    piece,
                    order,
                });
                orm.em.persist(newCp);
            }
            orm.em.remove(p);
        }
        await orm.em.flush();
        res.json(piece);
    } catch (e) {
        respondWithError(e as Error, res);
    }
});

pieceRouter.post('/actions/pieces/merge', async (req, res) => {
    const pieceIds = req.body.ids as string[];
    try {
        const pieces = await orm.em.find(
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
                orm.em.remove(cp);
                const newCp = orm.em.create(CalendarPiece, {
                    calendar,
                    piece,
                    order,
                });
                orm.em.persist(newCp);
            }
            orm.em.remove(p);
        }
        await orm.em.flush();
        res.json(piece);
    } catch (e) {
        respondWithError(e as Error, res);
    }
});

pieceRouter.post('/actions/pieces/trim', async (_req, res) => {
    const [pieces, count] = await orm.em.findAndCount(Piece, {
        $or: [{ composer: /^ .*/i }, { piece: /^ .*/i }],
    });
    for (const p of pieces) {
        p.composer = p.composer?.trim();
        p.piece = p.piece?.trim();
    }
    await orm.em.flush();
    setGetListHeaders(res, count, pieces.length);
    res.json({ count, rows: pieces });
});

export const pieceHandler = pieceRouter;
