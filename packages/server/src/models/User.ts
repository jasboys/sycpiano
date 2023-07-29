import {
    Collection,
    Entity,
    ManyToMany,
    PrimaryKey,
    Property,
} from '@mikro-orm/core';
import { Product } from './Product.js';
import { UserProduct } from './UserProduct.js';

@Entity()
export class User {
    @PrimaryKey({ columnType: 'text' })
    id!: string;

    @Property({ length: 6, nullable: true })
    createdAt?: Date;

    @Property({ length: 6, nullable: true })
    updatedAt?: Date;

    @Property({ columnType: 'text', nullable: true })
    username?: string;

    @Property({ columnType: 'text', nullable: true })
    passHash?: string;

    @Property({ columnType: 'text', nullable: true })
    pasetoSecret?: string;

    @Property({ columnType: 'text', nullable: true })
    resetToken?: string;

    @Property({ columnType: 'text', nullable: true })
    role?: string;

    @Property({ columnType: 'text', nullable: true })
    session?: string;

    @Property({ length: 6, nullable: true })
    lastRequest?: Date;

    @ManyToMany({ entity: () => Product, pivotEntity: () => UserProduct })
    products = new Collection<Product>(this);
}
