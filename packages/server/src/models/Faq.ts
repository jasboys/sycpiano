import { Entity, OptionalProps, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Faq {
    [OptionalProps]?: 'id';

    @PrimaryKey({ columnType: 'uuid', defaultRaw: 'gen_random_uuid()' })
    id!: string;

    @Property({ columnType: 'text', nullable: true })
    question?: string;

    @Property({ columnType: 'text', nullable: true })
    answer?: string;

    @Property({ nullable: true })
    order?: number;
}
