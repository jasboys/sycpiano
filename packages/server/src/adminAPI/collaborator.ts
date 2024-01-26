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
            const collaborator = await orm.em.findOneOrFail(
                Collaborator,
                collabId,
            );
            const allMatchingCollabs = await orm.em.find(
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
                    orm.em.remove(cc);
                    const newCc = orm.em.create(CalendarCollaborator, {
                        calendar,
                        collaborator,
                        order,
                    });
                    orm.em.persist(newCc);
                }
                orm.em.remove(c);
            }
            await orm.em.flush();
            res.json(collaborator);
        } catch (e) {
            respondWithError(e as Error, res);
        }
    },
);

collaboratorRouter.post('/actions/collaborators/merge', async (req, res) => {
    const collabIds = req.body.ids as string[];
    try {
        const collaborators = await orm.em.find(
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
                orm.em.remove(cc);
                const newCp = orm.em.create(CalendarCollaborator, {
                    calendar,
                    collaborator,
                    order,
                });
                orm.em.persist(newCp);
            }
            orm.em.remove(c);
        }
        await orm.em.flush();
        res.json(collaborator);
    } catch (e) {
        respondWithError(e as Error, res);
    }
});

collaboratorRouter.post('/actions/collaborators/trim', async (_req, res) => {
    const [collaborators, count] = await orm.em.findAndCount(Collaborator, {
        $or: [{ name: /^ .*/i }, { instrument: /^ .*/i }],
    });
    for (const p of collaborators) {
        p.name = p.name?.trim();
        p.instrument = p.instrument?.trim();
    }
    await orm.em.flush();
    setGetListHeaders(res, count, collaborators.length);
    res.json({ count, rows: collaborators });
});

export const collaboratorHandler = collaboratorRouter;
