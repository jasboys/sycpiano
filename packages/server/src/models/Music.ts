import { Collection, Entity, OneToMany, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';
import { MusicFile } from './MusicFile.js';

@Entity()
export class Music {

  [OptionalProps]?: 'id';

  @PrimaryKey({ columnType: 'uuid', defaultRaw: `gen_random_uuid()` })
  id!: string;

  @Property({ columnType: 'text' })
  composer!: string;

  @Property({ columnType: 'text' })
  piece!: string;

  @Property({ columnType: 'text', nullable: true })
  contributors?: string;

  @Property({ columnType: 'text' })
  type!: string;

  @Property({ nullable: true })
  year?: number;

  @OneToMany({ entity: () => MusicFile, mappedBy: 'music', orderBy: { 'name': 'asc' } })
  musicFiles = new Collection<MusicFile>(this);

}
