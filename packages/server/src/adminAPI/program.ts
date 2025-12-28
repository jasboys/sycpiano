import { type FilterQuery, type QueryOrderMap, wrap } from '@mikro-orm/core';
import {
    adjectives,
    animals,
    colors,
    uniqueNamesGenerator,
} from 'unique-names-generator';
import orm from '../database.js';
import { Calendar } from '../models/Calendar.js';
import { CalendarPiece } from '../models/CalendarPiece.js';
import { Program } from '../models/Program.js';
import { ProgramPiece } from '../models/ProgramPiece.js';
import { crud } from './crud.js';
import { respondWithError } from './index.js';
import { mikroCrud } from './mikroCrud.js';
import { NotFoundError } from './types.js';

const mapSearchFields = (token: string) =>
    ['nickname', 'pieces.composer', 'pieces.piece'].map((field) => {
        const split = field.split('.');
        if (split.length === 1) {
            return {
                [field]: {
                    $ilike: `%${token}%`,
                },
            };
        }
        return {
            [split[0]]: {
                $some: {
                    [split[1]]: {
                        $ilike: `%${token}%`,
                    },
                },
            },
        };
    });

export const programHandler = crud('/programs', {
    ...mikroCrud({
        entity: Program,
        populate: ['pieces', 'programPieces'],
        searchableFields: ['nickname'],
    }),
    create: async (body) => {
        if (!body.nickname) {
            body.nickname = uniqueNamesGenerator({
                dictionaries: [adjectives, colors, animals],
            });
        }
        const created = orm.em.create(Program, body);
        await orm.em.persist(created).flush();
        return created;
    },
    getOne: async (id) => {
        const prog = await orm.em.findOneOrFail(
            Program,
            { id },
            {
                populate: ['pieces', 'programPieces', 'programPieces.piece'],
            },
        );
        const { programPieces, ...plainProg } = wrap(prog).toPOJO();
        return {
            ...plainProg,
            pieces: programPieces.map((val) => {
                return {
                    ...val.piece,
                    order: val.order,
                    pivotId: val.id,
                };
            }),
        };
    },
    getList: async ({ filter, limit, offset, order }) => {
        const progs = await orm.em.findAndCount(
            Program,
            filter as FilterQuery<Program>,
            {
                limit,
                offset,
                orderBy: order as QueryOrderMap<Program>,
                populate: ['pieces', 'programPieces', 'programPieces.piece'],
            },
        );

        return {
            count: progs[1],
            rows: progs[0].map((prog) => {
                const { programPieces, ...plainProg } = wrap(prog).toPOJO();
                return {
                    ...plainProg,
                    pieces: programPieces.map((val) => {
                        return {
                            ...val.piece,
                            order: val.order,
                            pivotId: val.id,
                        };
                    }),
                };
            }),
        };
    },
    search: async ({ q, limit }, _) => {
        const matchArray = q.trim().match(/^id:(.*)$/i);
        let where: FilterQuery<Program>;
        if (matchArray?.[1]) {
            where = {
                id: {
                    $ilike: `%${matchArray[1]}%`,
                },
            };
        } else {
            const tokens = q.trim().replaceAll(', ', '|').replaceAll(' ', '&');
            const splitTokens = tokens.split('|').map((t) => t.split('&'));
            where = {
                $or: splitTokens.map((token) => {
                    return {
                        $and: token.map((v) => {
                            return {
                                $or: mapSearchFields(v),
                            };
                        }),
                    };
                }),
            };
        }
        const programResults = await orm.em.findAndCount(Program, where, {
            populate: ['pieces', 'programPieces', 'programPieces.piece'],
            limit,
        });
        return {
            count: programResults[1],
            rows: programResults[0].map((prog) => {
                const { programPieces, ...plainProg } = wrap(prog).toPOJO();
                return {
                    ...plainProg,
                    pieces: programPieces.map((val) => {
                        return {
                            ...val.piece,
                            order: val.order,
                            pivotId: val.id,
                        };
                    }),
                };
            }),
        };
    },
});

programHandler.post('/actions/programs/extract', async (req, res) => {
    const calId: string = req.body.calendarId;
    const nickname: string | undefined = req.body.nickname;
    try {
        const cal = await orm.em.findOneOrFail(
            Calendar,
            { id: calId },
            {
                populate: ['calendarPieces'],
                failHandler: () => new NotFoundError(),
            },
        );
        const program = orm.em.create(Program, {
            nickname:
                nickname ??
                uniqueNamesGenerator({
                    dictionaries: [adjectives, colors, animals],
                }),
        });
        orm.em.persist(program);
        for (const calendarPiece of cal.calendarPieces) {
            const programPiece = orm.em.create(ProgramPiece, {
                program,
                piece: calendarPiece.piece,
                order: calendarPiece.order,
            });
            orm.em.persist(programPiece);
        }
        await orm.em.flush();

        res.json({ program });
    } catch (e) {
        respondWithError(e as Error, res);
    }
});

programHandler.post('/actions/programs/import', async (req, res) => {
    try {
        const calId: string = req.body.calendarId;
        const progId: string = req.body.programId;
        const cal = await orm.em.findOneOrFail(
            Calendar,
            { id: calId },
            {
                populate: ['pieces', 'calendarPieces', 'calendarPieces.piece'],
                failHandler: () => new NotFoundError(),
            },
        );
        const highestOrder = cal.calendarPieces.length
            ? cal.calendarPieces.reduce((prev, item) => {
                  return item.order ? Math.max(prev, item.order) : prev;
              }, 0) + 1
            : 0;
        const prog = await orm.em.findOneOrFail(
            Program,
            { id: progId },
            {
                populate: ['programPieces'],
                failHandler: () => new NotFoundError(),
            },
        );
        for (const programPiece of prog.programPieces) {
            const calPiece = orm.em.create(CalendarPiece, {
                piece: programPiece.piece,
                calendar: cal.id,
                order: programPiece.order
                    ? programPiece.order + highestOrder
                    : undefined,
            });
            orm.em.persist(calPiece);
        }
        await orm.em.flush();

        res.json({ calendar: cal });
    } catch (e) {
        respondWithError(e as Error, res);
    }
});
