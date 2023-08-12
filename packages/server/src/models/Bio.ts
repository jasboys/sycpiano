import { Entity, PrimaryKey, Property } from '@mikro-orm/core';

@Entity()
export class Bio {
    @PrimaryKey()
    id!: number;

    @Property()
    paragraph!: number;

    @Property({ columnType: 'text' })
    text!: string;
}
