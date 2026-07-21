import { defineEntity, p } from '@mikro-orm/core';
import { MusicFile } from './MusicFile.js';

const musicSchema = defineEntity({
    name: 'Music',
    properties: {
        id: p.uuid().primary().defaultRaw('gen_random_uuid'),
        composer: p.text(),
        piece: p.text(),
        contributors: p.text().nullable(),
        type: p.text(),
        year: p.integer().nullable(),
        musicFiles: () =>
            p.oneToMany(MusicFile).mappedBy('music').orderBy({ name: 'ASC' }),
    },
});

export class Music extends musicSchema.class {}

musicSchema.setClass(Music);

// @Entity()
// export class Music {
//     [OptionalProps]?: 'id';

//     @PrimaryKey({ columnType: 'uuid', defaultRaw: 'gen_random_uuid()' })
//     id!: string;

//     @Property({ columnType: 'text' })
//     composer!: string;

//     @Property({ columnType: 'text' })
//     piece!: string;

//     @Property({ columnType: 'text', nullable: true })
//     contributors?: string;

//     @Property({ columnType: 'text' })
//     type!: string;

//     @Property({ nullable: true })
//     year?: number;

//     @OneToMany({
//         entity: () => MusicFile,
//         mappedBy: 'music',
//         orderBy: { name: 'asc' },
//     })
//     musicFiles = new Collection<MusicFile>(this);
// }
