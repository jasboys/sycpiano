import {
    Collection,
    Entity,
    Index,
    ManyToMany,
    OneToMany,
    OptionalProps,
    PrimaryKey,
    Property,
} from '@mikro-orm/core';
import { CalendarCollaborator } from './CalendarCollaborator.js';
import { Calendar } from './Calendar.js';

@Entity()
export class Collaborator {
    [OptionalProps]?: 'id';

    @PrimaryKey({ columnType: 'uuid', defaultRaw: 'gen_random_uuid()' })
    id!: string;

    @Property({ columnType: 'text', nullable: true })
    name?: string;

    @Property({ columnType: 'text', nullable: true })
    instrument?: string;

    @Index({ name: 'collaborator_search' })
    @Property({ fieldName: '_search', columnType: 'tsvector', nullable: true })
    Search?: unknown;

    @OneToMany({
        entity: () => CalendarCollaborator,
        mappedBy: (cc) => cc.collaborator,
    })
    calendarCollaborators = new Collection<CalendarCollaborator>(this);

    @ManyToMany({
        entity: () => Calendar,
        pivotEntity: () => CalendarCollaborator,
        mappedBy: (c) => c.collaborators,
        orderBy: { dateTime: 'DESC' },
    })
    calendars = new Collection<Calendar>(this);

    @Property({ persist: false })
    order?: number;
}
