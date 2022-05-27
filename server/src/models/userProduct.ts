import { DataTypes, Model, Sequelize } from 'sequelize';
import { ModelExport, ModelMap } from '../types';

export interface UserProductAttributes {
    id: string;
    userId: string;
    productId: string;
}

export class userProduct extends Model<UserProductAttributes, UserProductAttributes> implements UserProductAttributes {
    declare id: string;
    declare userId: string;
    declare productId: string;
    declare readonly createdAt?: Date | string;
    declare readonly updatedAt?: Date | string;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes): ModelExport<userProduct> => {
    userProduct.init({
        id: {
            allowNull: false,
            defaultValue: dataTypes.UUIDV4,
            primaryKey: true,
            type: dataTypes.UUID,
            unique: true,
        },
        userId: {
            type: dataTypes.STRING,
            field: 'user_id',
        },
        productId: {
            type: dataTypes.STRING,
            field: 'product_id',
        },
    }, {
            sequelize,
            tableName: 'user_product',
        });

    const associate = (models: ModelMap) => {
        userProduct.belongsTo(models.user);
        userProduct.belongsTo(models.product);
    };

    return {
        model: userProduct,
        associate,
    };
};
