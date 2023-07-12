import type { Rel } from '@mikro-orm/core';
import { Entity, ManyToOne } from '@mikro-orm/core';
import { Product } from './Product.js';
import { User } from './User.js';

@Entity()
export class UserProduct {

  @ManyToOne({ entity: () => User, onDelete: 'cascade', primary: true, index: 'user_product_user_idx' })
  user!: Rel<User>;

  @ManyToOne({ entity: () => Product, onDelete: 'cascade', primary: true, index: 'user_product_product_idx' })
  product!: Rel<Product>;

}
