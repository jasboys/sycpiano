import type { EventArgs } from '@mikro-orm/core';
import { defineEntity, p } from '@mikro-orm/core';
import { transformModelToGoogle, updateCalendar } from '../gapi/calendar.js';
import { Calendar } from './Calendar.js';
import { Collaborator } from './Collaborator.js';

const hook = async (args: EventArgs<CalendarCollaborator>) => {
    const calendarId = args.entity.calendar.id;
    const cal = await args.em.findOneOrFail(Calendar, calendarId, {
        populate: ['pieces', 'collaborators'],
    });
    const data = transformModelToGoogle(cal);
    await updateCalendar(args.em, data);
};

const calendarCollaboratorSchema = defineEntity({
    name: 'CalendarCollaborator',
    properties: {
        id: p.uuid().defaultRaw('gen_random_uuid'),
        calendar: () =>
            p
                .manyToOne(Calendar)
                .primary()
                .index('calendar_collaborator_calendar_idx'),
        collaborator: () =>
            p
                .manyToOne(Collaborator)
                .primary()
                .index('calendar_collaborator_collaborator_idx'),
        order: p.integer().nullable(),
    },
});

export class CalendarCollaborator extends calendarCollaboratorSchema.class {}

calendarCollaboratorSchema.setClass(CalendarCollaborator);

calendarCollaboratorSchema.addHook(
    'afterCreate',
    async (args: EventArgs<CalendarCollaborator>) => {
        await hook(args);
    },
);

calendarCollaboratorSchema.addHook(
    'afterUpdate',
    async (args: EventArgs<CalendarCollaborator>) => {
        await hook(args);
    },
);

calendarCollaboratorSchema.addHook(
    'afterDelete',
    async (args: EventArgs<CalendarCollaborator>) => {
        await hook(args);
    },
);

// @Entity()
// export class CalendarCollaborator {
//     @Property({ columnType: 'uuid', defaultRaw: 'gen_random_uuid()' })
//     id!: string;

//     @ManyToOne({
//         entity: () => Calendar,
//         primary: true,
//         index: 'calendar_collaborator_calendar_idx',
//     })
//     calendar!: Rel<Calendar>;

//     @ManyToOne({
//         entity: () => Collaborator,
//         primary: true,
//         index: 'calendar_collaborator_collaborator_idx',
//     })
//     collaborator!: Rel<Collaborator>;

//     @Property({ nullable: true })
//     order?: number;

//     @AfterCreate()
//     async afterCreate(args: EventArgs<CalendarCollaborator>) {
//         await hook(args);
//     }

//     @AfterUpdate()
//     async afterUpdate(args: EventArgs<CalendarCollaborator>) {
//         await hook(args);
//     }

//     @AfterDelete()
//     async afterDelete(args: EventArgs<CalendarCollaborator>) {
//         await hook(args);
//     }
// }
