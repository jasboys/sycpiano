import { parse } from 'node:path';
import type { Rel } from '@mikro-orm/core';
import {
    Entity,
    ManyToOne,
    OptionalProps,
    PrimaryKey,
    Property,
} from '@mikro-orm/core';
import { Music } from './Music.js';

@Entity()
export class MusicFile {
    [OptionalProps]?: 'id';

    @PrimaryKey({ columnType: 'uuid', defaultRaw: 'gen_random_uuid()' })
    id!: string;

    @Property({ columnType: 'text', nullable: true })
    name?: string;

    @Property({ columnType: 'text' })
    audioFile!: string;

    @Property({ persist: false })
    get waveformFile() {
        return `${parse(this.audioFile).name}.dat`;
    }

    @Property()
    durationSeconds!: number;

    @ManyToOne({
        entity: () => Music,
        index: 'music_file_music_idx',
    })
    music!: Rel<Music>;

    @Property({ columnType: 'text', nullable: true })
    hash!: string;
}
