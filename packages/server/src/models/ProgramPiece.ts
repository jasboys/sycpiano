import { defineEntity, p } from '@mikro-orm/core';
import { Piece } from './Piece.js';
import { Program } from './Program.js';

const programPieceSchema = defineEntity({
    name: 'ProgramPiece',
    properties: {
        id: p.uuid().primary().defaultRaw('gen_random_uuid'),
        program: () =>
            p.manyToOne(Program).primary().index('program_piece_program_idx'),
        piece: () =>
            p.manyToOne(Piece).primary().index('program_piece_piece_idx'),
        order: p.integer().nullable(),
    },
});

export class ProgramPiece extends programPieceSchema.class {}
programPieceSchema.setClass(ProgramPiece);

// @Entity()
// export class ProgramPiece {
//     @Property({ columnType: 'uuid', defaultRaw: 'gen_random_uuid()' })
//     id!: string;

//     @ManyToOne({
//         entity: () => Program,
//         primary: true,
//         index: 'program_piece_program_idx',
//     })
//     program!: Rel<Program>;

//     @ManyToOne({
//         entity: () => Piece,
//         primary: true,
//         index: 'program_piece_piece_idx',
//     })
//     piece!: Rel<Piece>;

//     @Property({ nullable: true })
//     order?: number;
// }
