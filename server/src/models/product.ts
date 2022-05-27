import { DataTypes, Sequelize, CreateOptions, Optional, InstanceUpdateOptions, Model } from 'sequelize';
import { createProduct, deleteProduct, updateProduct } from '../stripe';
import { ModelExport, ModelMap } from '../types';

export const ProductTypes = ['arrangement', 'cadenza', 'original'] as const;

export interface ProductAttributes {
    id: string;
    file: string;
    name: string;
    permalink: string;
    description: string;
    sample: string;
    images: string[];
    pages: number;
    price: number; // in cents
    priceID: string;
    type: typeof ProductTypes[number];
}

export interface ProductCreationAttributes extends Optional<ProductAttributes, 'sample' | 'images'> {}

export class product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
    declare id: string;
    declare file: string;
    declare name: string;
    declare permalink: string;
    declare description: string;
    declare sample: string;
    declare images: string[];
    declare pages: number;
    declare price: number; // in cents
    declare priceID: string;
    declare type: typeof ProductTypes[number];
    declare readonly createdAt?: Date | string;
    declare readonly updatedAt?: Date | string;
}

const beforeCreateHook = async (p: product, _: CreateOptions) => {
    try {
        const [productID, priceID] = await createProduct(p);
        p.id = productID;
        p.priceID = priceID;
    } catch (e) {
        console.log('Failed to get IDs for new product', e);
    }
};

const beforeUpdateHook = async (p: product, _: InstanceUpdateOptions<ProductAttributes>) => {
    try {
        const [productID, priceID] = await updateProduct(p);
        p.id = productID;
        p.priceID = priceID;
    } catch (e) {
        console.log('Failed to get IDs for updated product', e);
    }
};

const beforeDestroyHook = async (p: product) => {
    try {
        await deleteProduct(p.id);
    } catch (e) {
        console.log('Failed to call delete Stripe product API');
    }
};

export default (sequelize: Sequelize, dataTypes: typeof DataTypes): ModelExport<product> => {
    product.init({
            id: {
                type: dataTypes.STRING,
                primaryKey: true,
                unique: true,
            },
            name: dataTypes.STRING,
            permalink: dataTypes.STRING,
            file: dataTypes.STRING,
            images: dataTypes.ARRAY(dataTypes.STRING),
            description: dataTypes.TEXT,
            sample: dataTypes.STRING,
            pages: dataTypes.INTEGER,
            price: dataTypes.INTEGER,
            priceID: {
                type: dataTypes.STRING,
                field: 'price_id',
            },
            type: {
                type: dataTypes.STRING,
                validate: {
                    isIn: [[...ProductTypes]]
                }
            }
        }, {
            sequelize,
            tableName: 'product',
            hooks: {
                beforeCreate: beforeCreateHook,
                beforeUpdate: beforeUpdateHook,
                beforeDestroy: beforeDestroyHook,
            },
        }
    );

    const associate = (models: ModelMap) => {
        product.hasMany(models.userProduct)
        product.belongsToMany(models.user, { through: models.userProduct });
    };

    return {
        model: product,
        associate,
    };
};
