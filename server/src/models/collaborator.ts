import { Collection, Entity, Index, ManyToMany, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';
import { Calendar } from './Calendar.js';
import { CalendarCollaborator } from './CalendarCollaborator.js';

@Entity()
export class Collaborator {

  [OptionalProps]?: 'id';

  @PrimaryKey({ columnType: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string;

  @Property({ columnType: 'text', nullable: true })
  name?: string;

  @Property({ length: 6, nullable: true })
  createdAt?: Date;

  @Property({ length: 6, nullable: true })
  updatedAt?: Date;

  @Property({ columnType: 'text', nullable: true })
  instrument?: string;

  @Index({ name: 'collaborator_search' })
  @Property({ fieldName: '_search', columnType: 'tsvector', nullable: true })
  Search?: unknown;

  @ManyToMany({ entity: () => CalendarCollaborator, mappedBy: cc => cc.collaborator })
  calendarCollaborators = new Collection<CalendarCollaborator>(this);

  @ManyToMany({ entity: () => Calendar, mappedBy: c => c.collaborators})
  collaborators = new Collection<Collaborator>(this);

}
