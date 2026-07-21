import { defineEntity, p } from '@mikro-orm/core';

const photoSchema = defineEntity({
    name: 'Photo',
    properties: {
        id: p.uuid().primary().defaultRaw('gen_random_uuid'),
        file: p.text().nullable(),
        width: p.integer().nullable(),
        height: p.integer().nullable(),
        thumbnailWidth: p.integer().nullable(),
        thumbnailHeight: p.integer().nullable(),
        dateTaken: p.datetime().nullable(),
        credit: p.text().nullable(),
        omitFromGallery: p.boolean().nullable(),
    },
});

export class Photo extends photoSchema.class {}
photoSchema.setClass(Photo);

// @Entity()
// export class Photo {
//     [OptionalProps]?: 'id';

//     @PrimaryKey({ columnType: 'uuid', defaultRaw: 'gen_random_uuid()' })
//     id!: string;

//     @Property({ columnType: 'text', nullable: true })
//     file?: string;

//     @Property({ nullable: true })
//     width?: number;

//     @Property({ nullable: true })
//     height?: number;

//     @Property({ nullable: true })
//     thumbnailWidth?: number;

//     @Property({ nullable: true })
//     thumbnailHeight?: number;

//     @Property({ nullable: true })
//     dateTaken?: Date;

//     @Property({ columnType: 'text', nullable: true })
//     credit?: string;

//     @Property({ nullable: true })
//     omitFromGallery?: boolean;
// }
