import { defineEntity, p } from '@mikro-orm/core';

// @Entity()
// export class Bio {
//     @PrimaryKey()
//     id!: number;

//     @Property()
//     paragraph!: number;

//     @Property({ columnType: 'text' })
//     text!: string;
// }

const BioSchema = defineEntity({
    name: 'Bio',
    properties: {
        id: p.integer().primary(),
        paragraph: p.integer(),
        text: p.text(),
    },
});

export class Bio extends BioSchema.class {}
BioSchema.setClass(Bio);
