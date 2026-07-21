import { parse } from 'node:path';
import { defineEntity, p } from '@mikro-orm/core';
import { Music } from './Music.js';

const musicFileSchema = defineEntity({
    name: 'MusicFile',
    properties: {
        id: p.uuid().primary().defaultRaw('gen_random_uuid'),
        name: p.text().nullable(),
        audioFile: p.text(),
        durationSeconds: p.integer(),
        hash: p.text().nullable(),
        music: () => p.manyToOne(Music).index('music_file_music_idx'),
    },
});

export class MusicFile extends musicFileSchema.class {
    get waveformFile() {
        return `${parse(this.audioFile).name}.dat`;
    }
}

musicFileSchema.setClass(MusicFile);

// @Entity()
// export class MusicFile {
//     [OptionalProps]?: 'id';

//     @PrimaryKey({ columnType: 'uuid', defaultRaw: 'gen_random_uuid()' })
//     id!: string;

//     @Property({ columnType: 'text', nullable: true })
//     name?: string;

//     @Property({ columnType: 'text' })
//     audioFile!: string;

//     @Property({ persist: false })
//     get waveformFile() {
//         return `${parse(this.audioFile).name}.dat`;
//     }

//     @Property()
//     durationSeconds!: number;

//     @ManyToOne({
//         entity: () => Music,
//         index: 'music_file_music_idx',
//     })
//     music!: Rel<Music>;

//     @Property({ columnType: 'text', nullable: true })
//     hash!: string;
// }
