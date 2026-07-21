import { defineEntity, p } from '@mikro-orm/core';

const AcclaimSchema = defineEntity({
    name: 'Acclaim',
    properties: {
        id: p.integer().primary(),
        quote: p.text().nullable(),
        short: p.text().nullable(),
        author: p.text().nullable(),
        shortAuthor: p.text().nullable(),
        website: p.text().nullable(),
        hasFullDate: p.boolean().default(true),
        date: p.date().nullable(),
    },
});

export class Acclaim extends AcclaimSchema.class {}
AcclaimSchema.setClass(Acclaim);

// @Entity()
// export class Acclaim {
//     [OptionalProps]?: 'hasFullDate';

//     @PrimaryKey()
//     id!: number;

//     @Property({ columnType: 'text', nullable: true })
//     quote?: string;

//     @Property({ columnType: 'text', nullable: true })
//     short?: string;

//     @Property({ columnType: 'text', nullable: true })
//     author?: string;

//     @Property({ columnType: 'text', nullable: true })
//     shortAuthor?: string;

//     @Property({ columnType: 'text', nullable: true })
//     website?: string;

//     @Property({ default: true })
//     hasFullDate: boolean = true;

//     @Property({ columnType: 'date', nullable: true })
//     date?: string;
// }
