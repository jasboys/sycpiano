import { Entity, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Photo {
    [OptionalProps]?: 'id';

    @PrimaryKey({ columnType: 'uuid', defaultRaw: 'gen_random_uuid()' })
    id!: string;

    @Property({ columnType: 'text', nullable: true })
    file?: string;

    @Property({ nullable: true })
    width?: number;

    @Property({ nullable: true })
    height?: number;

    @Property({ nullable: true })
    thumbnailWidth?: number;

    @Property({ nullable: true })
    thumbnailHeight?: number;

    @Property({ nullable: true })
    dateTaken?: Date;

    @Property({ columnType: 'text', nullable: true })
    credit?: string;
}
