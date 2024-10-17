import {
    AfterDelete,
    BeforeCreate,
    BeforeUpdate,
    Collection,
    Entity,
    type EventArgs,
    ManyToMany,
    PrimaryKey,
    Property,
} from '@mikro-orm/core';
import { createProduct, deleteProduct, updateProduct } from '../stripe.js';
import { User } from './User.js';

export const ProductTypes = ['arrangement', 'cadenza', 'original'] as const;

@Entity()
export class Product {
    @PrimaryKey({ columnType: 'text' })
    id!: string;

    @Property({ columnType: 'text' })
    name!: string;

    @Property({ columnType: 'text' })
    file!: string;

    @Property({ columnType: 'text', nullable: true })
    description?: string;

    @Property({ columnType: 'text', nullable: true })
    sample?: string;

    @Property({ nullable: true })
    images?: string[];

    @Property({ nullable: true })
    pages?: number;

    @Property({})
    price!: number;

    @Property({ columnType: 'text', nullable: true })
    type?: string;

    @Property({ columnType: 'text' })
    priceId!: string;

    @Property({ columnType: 'text', nullable: true })
    permalink?: string;

    @Property({})
    purchasedCount?: number;

    @ManyToMany({ entity: () => User, mappedBy: (u) => u.products })
    users = new Collection<User>(this);

    @BeforeCreate()
    async beforeCreate(args: EventArgs<Product>) {
        try {
            const [productId, priceId] = await createProduct(args.entity);
            args.entity.id = productId;
            args.entity.priceId = priceId;
        } catch (e) {
            console.log('Failed to get IDs for new product', e);
        }
    }

    @BeforeUpdate()
    async beforeUpdate(args: EventArgs<Product>) {
        try {
            const [productId, priceId] = await updateProduct(args.entity);
            args.entity.id = productId;
            args.entity.priceId = priceId;
        } catch (e) {
            console.log('Failed to get IDs for new product', e);
        }
    }

    @AfterDelete()
    async afterDelete(args: EventArgs<Product>) {
        try {
            await deleteProduct(args.entity.id);
        } catch (e) {
            console.log('Failed to call delete Stripe product API');
        }
    }
}
