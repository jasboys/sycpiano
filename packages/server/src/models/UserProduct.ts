import type { Rel } from '@mikro-orm/core';
import { Entity, ManyToOne, OptionalProps, Property } from '@mikro-orm/core';
import { Product } from './Product.js';
import { User } from './User.js';

@Entity()
export class UserProduct {
    [OptionalProps]?: 'dummy';

    @Property({ persist: false })
    get dummy() {
        return '';
    }

    @ManyToOne({
        entity: () => User,
        primary: true,
        index: 'user_product_user_idx',
    })
    user!: Rel<User>;

    @ManyToOne({
        entity: () => Product,
        primary: true,
        index: 'user_product_product_idx',
    })
    product!: Rel<Product>;
}
