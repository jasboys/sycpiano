import { defineEntity, p } from '@mikro-orm/core';
import { Product } from './Product.js';
import { UserProduct } from './UserProduct.js';

const userSchema = defineEntity({
    name: 'User',
    properties: {
        id: p.text().primary(),
        username: p.text().nullable(),
        passHash: p.text().nullable(),
        pasetoSecret: p.text().nullable(),
        resetToken: p.text().nullable(),
        role: p.text().nullable(),
        session: p.text().nullable(),
        lastRequest: p.datetime(6).nullable(),
        products: () => p.manyToMany(Product).pivotEntity(() => UserProduct),
    },
});

export class User extends userSchema.class {}
userSchema.setClass(User);

// @Entity()
// export class User {
//     @PrimaryKey({ columnType: 'text' })
//     id!: string;

//     @Property({ columnType: 'text', nullable: true })
//     username?: string;

//     @Property({ columnType: 'text', nullable: true })
//     passHash?: string;

//     @Property({ columnType: 'text', nullable: true })
//     pasetoSecret?: string;

//     @Property({ columnType: 'text', nullable: true })
//     resetToken?: string;

//     @Property({ columnType: 'text', nullable: true })
//     role?: string;

//     @Property({ columnType: 'text', nullable: true })
//     session?: string;

//     @Property({ length: 6, nullable: true })
//     lastRequest?: Date;

//     @ManyToMany({ entity: () => Product, pivotEntity: () => UserProduct })
//     products = new Collection<Product>(this);
// }
