import { defineEntity, type EventArgs, p } from '@mikro-orm/core';
import { createProduct, deleteProduct, updateProduct } from '../stripe.js';
import { User } from './User.js';

export const ProductTypes = ['arrangement', 'cadenza', 'original'] as const;

const productSchema = defineEntity({
    name: 'Product',
    properties: {
        id: p.text().primary(),
        name: p.text(),
        file: p.text(),
        description: p.text().nullable(),
        sample: p.text().nullable(),
        images: p.array().nullable(),
        pages: p.integer().nullable(),
        price: p.integer(),
        type: p.text().nullable(),
        priceId: p.text(),
        permalink: p.text().nullable(),
        purchasedCount: p.integer().default(0),
        users: () => p.manyToMany(User).mappedBy('products'),
    },
});

export class Product extends productSchema.class {}
productSchema.setClass(Product);

productSchema.addHook('beforeCreate', async (args: EventArgs<Product>) => {
    try {
        const [productId, priceId] = await createProduct(args.entity);
        args.entity.id = productId;
        args.entity.priceId = priceId;
    } catch (e) {
        console.log('Failed to get IDs for new product', e);
    }
});

productSchema.addHook('beforeUpdate', async (args: EventArgs<Product>) => {
    try {
        const [productId, priceId] = await updateProduct(args.entity);
        args.entity.id = productId;
        args.entity.priceId = priceId;
    } catch (e) {
        console.log('Failed to get IDs for new product', e);
    }
});

productSchema.addHook('afterDelete', async (args: EventArgs<Product>) => {
    try {
        await deleteProduct(args.entity.id);
    } catch (_e) {
        console.log('Failed to call delete Stripe product API');
    }
});

// @Entity()
// export class Product {
//     @PrimaryKey({ columnType: 'text' })
//     id!: string;

//     @Property({ columnType: 'text' })
//     name!: string;

//     @Property({ columnType: 'text' })
//     file!: string;

//     @Property({ columnType: 'text', nullable: true })
//     description?: string;

//     @Property({ columnType: 'text', nullable: true })
//     sample?: string;

//     @Property({ nullable: true })
//     images?: string[];

//     @Property({ nullable: true })
//     pages?: number;

//     @Property()
//     price!: number;

//     @Property({ columnType: 'text', nullable: true })
//     type?: string;

//     @Property({ columnType: 'text' })
//     priceId!: string;

//     @Property({ columnType: 'text', nullable: true })
//     permalink?: string;

//     @Property()
//     purchasedCount: number & Opt = 0;

//     @ManyToMany({ entity: () => User, mappedBy: (u) => u.products })
//     users = new Collection<User>(this);

//     @BeforeCreate()
//     async beforeCreate(args: EventArgs<Product>) {
//         try {
//             const [productId, priceId] = await createProduct(args.entity);
//             args.entity.id = productId;
//             args.entity.priceId = priceId;
//         } catch (e) {
//             console.log('Failed to get IDs for new product', e);
//         }
//     }

//     @BeforeUpdate()
//     async beforeUpdate(args: EventArgs<Product>) {
//         try {
//             const [productId, priceId] = await updateProduct(args.entity);
//             args.entity.id = productId;
//             args.entity.priceId = priceId;
//         } catch (e) {
//             console.log('Failed to get IDs for new product', e);
//         }
//     }

//     @AfterDelete()
//     async afterDelete(args: EventArgs<Product>) {
//         try {
//             await deleteProduct(args.entity.id);
//         } catch (_e) {
//             console.log('Failed to call delete Stripe product API');
//         }
//     }
// }
