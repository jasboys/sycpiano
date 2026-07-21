import { defineEntity, p } from '@mikro-orm/core';
import { Calendar } from './Calendar.js';
import { CalendarCollaborator } from './CalendarCollaborator.js';

const collaboratorSchema = defineEntity({
    name: 'Collaborator',
    properties: {
        id: p.uuid().primary().defaultRaw('gen_random_uuid'),
        name: p.text().nullable(),
        instrument: p.text().nullable(),
        calendarCollaborators: () =>
            p.oneToMany(CalendarCollaborator).mappedBy('collaborator'),
        calendars: () =>
            p
                .manyToMany(Calendar)
                .pivotEntity(() => CalendarCollaborator)
                .mappedBy('collaborators')
                .orderBy({ dateTime: 'DESC' }),
        order: p.integer().nullable().persist(false),
    },
});

export class Collaborator extends collaboratorSchema.class {}
collaboratorSchema.setClass(Collaborator);

// @Entity()
// export class Collaborator {
//     [OptionalProps]?: 'id';

//     @PrimaryKey({ columnType: 'uuid', defaultRaw: 'gen_random_uuid()' })
//     id!: string;

//     @Property({ columnType: 'text', nullable: true })
//     name?: string;

//     @Property({ columnType: 'text', nullable: true })
//     instrument?: string;

//     @OneToMany({
//         entity: () => CalendarCollaborator,
//         mappedBy: (cc) => cc.collaborator,
//     })
//     calendarCollaborators = new Collection<CalendarCollaborator>(this);

//     @ManyToMany({
//         entity: () => Calendar,
//         pivotEntity: () => CalendarCollaborator,
//         mappedBy: (c) => c.collaborators,
//         orderBy: { dateTime: 'DESC' },
//     })
//     calendars = new Collection<Calendar>(this);

//     @Property({ persist: false })
//     order?: number;
// }
