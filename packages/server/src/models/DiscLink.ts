import { defineEntity, p } from '@mikro-orm/core';
import { Disc } from './Disc.js';

const discLinkSchema = defineEntity({
    name: 'DiscLink',
    properties: {
        id: p.uuid().primary().defaultRaw('gen_random_uuid()'),
        type: p.text().nullable(),
        url: p.text().nullable(),
        disc: () => p.manyToOne(Disc).index('disc_link_disc_idx'),
    },
});

export class DiscLink extends discLinkSchema.class {}

discLinkSchema.setClass(DiscLink);

// @Entity()
// export class DiscLink {
//     [OptionalProps]?: 'id';

//     @PrimaryKey({ columnType: 'uuid', defaultRaw: 'gen_random_uuid()' })
//     id!: string;

//     @Property({ columnType: 'text', nullable: true })
//     type?: string;

//     @Property({ columnType: 'text', nullable: true })
//     url?: string;

//     @ManyToOne({
//         entity: () => Disc,
//         index: 'disc_link_disc_idx',
//     })
//     disc!: Rel<Disc>;
// }
