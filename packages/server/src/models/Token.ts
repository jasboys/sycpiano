import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Token {
    @PrimaryKey({ columnType: 'text' })
    id!: string;

    @Property({ columnType: 'text' })
    token!: string;

    @Property({ length: 6, nullable: true })
    expires?: Date;
}
