import type { EntityData } from '@mikro-orm/core';
import orm from '../database.js';
import { Calendar } from '../models/Calendar.js';
import { CalendarCollaborator } from '../models/CalendarCollaborator.js';
import { Collaborator } from '../models/Collaborator.js';
import { crud } from './crud.js';
import { mikroCrud } from './mikroCrud.js';
import { NotFoundError } from './types.js';

interface CalendarCollaboratorCreate extends EntityData<CalendarCollaborator> {
    ref?: string;
    name: string;
    instrument: string;
    order: number;
    calendarId: string;
}

export const calendarCollaboratorHandler = crud('/calendar-collaborators', {
    ...mikroCrud({ entity: CalendarCollaborator }),
    create: async (body) => {
        const createBody = body as CalendarCollaboratorCreate;
        const { cal, calCollab } = await orm.em.transactional(
            async (forkedEm) => {
                const cal = await forkedEm.findOneOrFail(Calendar, {
                    id: createBody.calendarId,
                });
                const collab =
                    createBody.id ??
                    forkedEm.create(Collaborator, {
                        name: createBody.name,
                        instrument: createBody.instrument,
                    });

                const calCollab = forkedEm.create(CalendarCollaborator, {
                    calendar: cal,
                    collaborator: collab,
                    order: createBody.order,
                });

                return { cal, calCollab };
            },
        );

        return {
            ...calCollab,
            id: cal.id,
        };
    },
    update: async (id, body) => {
        const record = await orm.em.findOneOrFail(
            CalendarCollaborator,
            { id },
            { failHandler: () => new NotFoundError() },
        );
        if (!!body.name || !!body.instrument) {
            const collab = await orm.em.findOneOrFail(Collaborator, {
                id: body.collaboratorId,
            });
            collab.instrument = body.instrument;
            collab.name = body.name;
        }
        if (body.order !== null) {
            record.order = body.order;
        }
        await orm.em.flush();
        return record;
    },
    destroy: async (id) => {
        const calCollab = await orm.em.findOneOrFail(CalendarCollaborator, {
            id,
        });
        orm.em.remove(calCollab);
        await orm.em.flush();
        return { id };
    },
});
