import type { Rel } from '@mikro-orm/core';
import {
    Entity,
    ManyToOne,
    OptionalProps,
    PrimaryKey,
    Property,
} from '@mikro-orm/core';
import { Disc } from './Disc.js';

@Entity()
export class DiscLink {
    [OptionalProps]?: 'id';

    @PrimaryKey({ columnType: 'uuid', defaultRaw: 'gen_random_uuid()' })
    id!: string;

    @Property({ columnType: 'text', nullable: true })
    type?: string;

    @Property({ columnType: 'text', nullable: true })
    url?: string;

    @ManyToOne({
        entity: () => Disc,
        onDelete: 'cascade',
        index: 'disc_link_disc_idx',
    })
    disc!: Rel<Disc>;
}
