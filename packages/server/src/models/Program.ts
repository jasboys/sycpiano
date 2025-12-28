import {
    Collection,
    Entity,
    ManyToMany,
    OneToMany,
    OptionalProps,
    PrimaryKey,
    Property,
} from '@mikro-orm/core';
import { Piece } from './Piece.js';
import { ProgramPiece } from './ProgramPiece.js';

@Entity()
export class Program {
    [OptionalProps]?: 'id';

    @PrimaryKey({ columnType: 'uuid', defaultRaw: 'gen_random_uuid()' })
    id!: string;

    @Property({ columnType: 'text', nullable: true })
    nickname?: string;

    @OneToMany({ entity: () => ProgramPiece, mappedBy: (pp) => pp.program })
    programPieces = new Collection<ProgramPiece>(this);

    @ManyToMany({
        entity: () => Piece,
        pivotEntity: () => ProgramPiece,
        fixedOrderColumn: 'order',
    })
    pieces = new Collection<Piece>(this);
}
