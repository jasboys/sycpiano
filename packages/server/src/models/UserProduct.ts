import { defineEntity, p } from '@mikro-orm/core';
import { Product } from './Product.js';
import { User } from './User.js';

const userProductSchema = defineEntity({
    name: 'UserProduct',
    properties: {
        user: () => p.manyToOne(User).primary().index('user_product_user_idx'),
        product: () =>
            p.manyToOne(Product).primary().index('user_product_product_idx'),
    },
});

export class UserProduct extends userProductSchema.class {}
userProductSchema.setClass(UserProduct);

// @Entity()
// export class UserProduct {
//     [OptionalProps]?: 'dummy';

//     @Property({ persist: false })
//     get dummy() {
//         return '';
//     }

//     @ManyToOne({
//         entity: () => User,
//         primary: true,
//         index: 'user_product_user_idx',
//     })
//     user!: Rel<User>;

//     @ManyToOne({
//         entity: () => Product,
//         primary: true,
//         index: 'user_product_product_idx',
//     })
//     product!: Rel<Product>;
// }
