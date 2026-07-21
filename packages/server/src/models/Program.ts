import { defineEntity, p } from '@mikro-orm/core';
import { Piece } from './Piece.js';
import { ProgramPiece } from './ProgramPiece.js';

const programSchema = defineEntity({
    name: 'Program',
    properties: {
        id: p.uuid().primary().defaultRaw('gen_random_uuid'),
        nickname: p.text().nullable(),
        programPieces: () =>
            p
                .oneToMany(ProgramPiece)
                .mappedBy('program')
                .orphanRemoval(true)
                .orderBy({ order: 'ASC' }),
        pieces: () =>
            p
                .manyToMany(Piece)
                .pivotEntity(() => ProgramPiece)
                .fixedOrderColumn('order'),
    },
});

export class Program extends programSchema.class {}
programSchema.setClass(Program);

// @Entity()
// export class Program {
//     [OptionalProps]?: 'id';

//     @PrimaryKey({ columnType: 'uuid', defaultRaw: 'gen_random_uuid()' })
//     id!: string;

//     @Property({ columnType: 'text', nullable: true })
//     nickname?: string;

//     @OneToMany({
//         entity: () => ProgramPiece,
//         mappedBy: (pp) => pp.program,
//         orphanRemoval: true,
//         orderBy: { order: 'ASC' },
//     })
//     programPieces = new Collection<ProgramPiece>(this);

//     @ManyToMany({
//         entity: () => Piece,
//         pivotEntity: () => ProgramPiece,
//         fixedOrderColumn: 'order',
//     })
//     pieces = new Collection<Piece>(this);
// }
