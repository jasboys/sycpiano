import type { Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Piece } from './Piece.js';
import { Program } from './Program.js';

@Entity()
export class ProgramPiece {
    @Property({ columnType: 'uuid', defaultRaw: 'gen_random_uuid()' })
    id!: string;

    @ManyToOne({
        entity: () => Program,
        primary: true,
        index: 'program_piece_program_idx',
    })
    program!: Rel<Program>;

    @ManyToOne({
        entity: () => Piece,
        primary: true,
        index: 'program_piece_piece_idx',
    })
    piece!: Rel<Piece>;

    @Property({ nullable: true })
    order?: number;
}
