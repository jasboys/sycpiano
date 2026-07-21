import { defineEntity, p } from '@mikro-orm/core';

const faqSchema = defineEntity({
    name: 'Faq',
    properties: {
        id: p.uuid().primary().defaultRaw('gen_random_uuid'),
        question: p.text().nullable(),
        answer: p.text().nullable(),
        order: p.integer().nullable(),
    },
});

export class Faq extends faqSchema.class {}

faqSchema.setClass(Faq);

// @Entity()
// export class Faq {
//     [OptionalProps]?: 'id';

//     @PrimaryKey({ columnType: 'uuid', defaultRaw: 'gen_random_uuid()' })
//     id!: string;

//     @Property({ columnType: 'text', nullable: true })
//     question?: string;

//     @Property({ columnType: 'text', nullable: true })
//     answer?: string;

//     @Property({ nullable: true })
//     order?: number;
// }
