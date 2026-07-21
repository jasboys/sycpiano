import { defineEntity, p } from '@mikro-orm/core';

const tokenSchema = defineEntity({
    name: 'Token',
    properties: {
        id: p.text().primary(),
        token: p.text(),
        expires: p.datetime(6).nullable(),
    },
});

export class Token extends tokenSchema.class {}
tokenSchema.setClass(Token);

// @Entity()
// export class Token {
//     @PrimaryKey({ columnType: 'text' })
//     id!: string;

//     @Property({ columnType: 'text' })
//     token!: string;

//     @Property({ length: 6, nullable: true })
//     expires?: Date;
// }
