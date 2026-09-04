import orm from '../database.js';
import { CalendarCollaborator } from '../models/CalendarCollaborator.js';
import { Collaborator } from '../models/Collaborator.js';
import { crud, setGetListHeaders } from './crud.js';
import { respondWithError } from './index.js';
import { mikroCrud } from './mikroCrud.js';

const collaboratorRouter = crud('/collaborators', {
    ...mikroCrud({
        entity: Collaborator,
        populate: ['calendars'],
        searchableFields: ['name', 'instrument'],
    }),
});

collaboratorRouter.post(
    '/actions/collaborators/merge-into/:id',
    async (req, res) => {
        const collabId = req.params.id;
        try {
            const collaborator = await orm.em.transactional(
                async (forkedEm) => {
                    const collaborator = await forkedEm.findOneOrFail(
                        Collaborator,
                        collabId,
                    );
                    const allMatchingCollabs = await forkedEm.find(
                        Collaborator,
                        {
                            $and: [
                                { name: collaborator.name },
                                { instrument: collaborator.instrument },
                            ],
                        },
                        { populate: ['calendarCollaborators'] },
                    );
                    const otherCollabs = allMatchingCollabs.filter(
                        (c) => c.id !== collabId,
                    );
                    for (const c of otherCollabs) {
                        const ccs = c.calendarCollaborators;
                        for (const cc of ccs) {
                            const order = cc.order;
                            const calendar = cc.calendar;
                            forkedEm.remove(cc);
                            forkedEm.create(CalendarCollaborator, {
                                calendar,
                                collaborator,
                                order,
                            });
                        }
                        forkedEm.remove(c);
                    }

                    return collaborator;
                },
            );

            res.json(collaborator);
        } catch (e) {
            respondWithError(e as Error, res);
        }
    },
);

collaboratorRouter.post('/actions/collaborators/merge', async (req, res) => {
    const collabIds = req.body.ids as string[];
    try {
        const collaborator = await orm.em.transactional(async (forkedEm) => {
            const collaborators = await forkedEm.find(
                Collaborator,
                { id: collabIds },
                { populate: ['calendarCollaborators'], orderBy: { id: 'ASC' } },
            );
            const [collaborator, ...otherCollabs] = collaborators;
            for (const c of otherCollabs) {
                const ccs = c.calendarCollaborators;
                for (const cc of ccs) {
                    const order = cc.order;
                    const calendar = cc.calendar;
                    forkedEm.remove(cc);
                    forkedEm.create(CalendarCollaborator, {
                        calendar,
                        collaborator,
                        order,
                    });
                }
                forkedEm.remove(c);
            }
            return collaborator;
        });

        res.json(collaborator);
    } catch (e) {
        respondWithError(e as Error, res);
    }
});

collaboratorRouter.post('/actions/collaborators/trim', async (_req, res) => {
    const { collaborators, count } = await orm.em.transactional(
        async (forkedEm) => {
            const [collaborators, count] = await forkedEm.findAndCount(
                Collaborator,
                {
                    $or: [{ name: /^ .*/i }, { instrument: /^ .*/i }],
                },
            );
            for (const p of collaborators) {
                p.name = p.name?.trim();
                p.instrument = p.instrument?.trim();
            }
            return { collaborators, count };
        },
    );
    setGetListHeaders(res, count, collaborators.length);
    res.json({ count, rows: collaborators });
});

export const collaboratorHandler = collaboratorRouter;
