import { defineEntity, p } from '@mikro-orm/core';
import { DiscLink } from './DiscLink.js';

const discSchema = defineEntity({
    name: 'Disc',
    properties: {
        id: p.uuid().primary().defaultRaw('gen_random_uuid'),
        title: p.text().nullable(),
        description: p.text().nullable(),
        label: p.text().nullable(),
        releaseDate: p.integer().nullable(),
        thumbnailFile: p.text().nullable(),
        discLink: () => p.oneToMany(() => DiscLink).mappedBy('disc'),
    },
});

export class Disc extends discSchema.class {}
discSchema.setClass(Disc);

// @Entity()
// export class Disc {
//     [OptionalProps]?: 'id';

//     @PrimaryKey({ columnType: 'uuid', defaultRaw: 'gen_random_uuid()' })
//     id!: string;

//     @Property({ columnType: 'text', nullable: true })
//     title?: string;

//     @Property({ columnType: 'text', nullable: true })
//     description?: string;

//     @Property({ columnType: 'text', nullable: true })
//     label?: string;

//     @Property({ nullable: true })
//     releaseDate?: number;

//     @Property({ columnType: 'text', nullable: true })
//     thumbnailFile?: string;

//     @OneToMany({ entity: () => DiscLink, mappedBy: 'disc' })
//     discLinks = new Collection<DiscLink>(this);
// }
