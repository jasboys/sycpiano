import { Collection, Entity, OneToMany, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';
import { DiscLink } from './DiscLink.js';

@Entity()
export class Disc {

  [OptionalProps]?: 'id';

  @PrimaryKey({ columnType: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string;

  @Property({ columnType: 'text', nullable: true })
  title?: string;

  @Property({ columnType: 'text', nullable: true })
  description?: string;

  @Property({ columnType: 'text', nullable: true })
  label?: string;

  @Property({ nullable: true })
  releaseDate?: number;

  @Property({ columnType: 'text', nullable: true })
  thumbnailFile?: string;

  @OneToMany({ entity: () => DiscLink, mappedBy: 'disc' })
  discLinks = new Collection<DiscLink>(this);

}
