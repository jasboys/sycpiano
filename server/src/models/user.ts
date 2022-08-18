import {
    DataTypes,
    Sequelize,
    BelongsToManyAddAssociationMixin,
    BelongsToManyRemoveAssociationMixin,
    BelongsToManyAddAssociationsMixin,
    BelongsToManyRemoveAssociationsMixin,
    BelongsToManyCountAssociationsMixin,
    Association,
    Model,
    BelongsToManyGetAssociationsMixin,
    BelongsToManySetAssociationsMixin,
    Optional
} from 'sequelize';
import { ModelExport, ModelMap } from '../types';
import { product } from './product';

export const UserRoles = ['admin', 'customer'] as const;

export interface UserAttributes {
    id: string;
    username: string;
    session?: string;
    passHash?: string;
    role: typeof UserRoles[number];
    pasetoSecret?: string;
    resetToken?: string;
    lastRequest?: Date;
}

interface UserCreationAttributes extends Optional<Omit<UserAttributes, 'pasetoSecret' | 'resetToken' | 'session' | 'lastRequest'>, 'id'> {}

export class user extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes{
    declare id: string;
    declare username: string;
    declare passHash?: string;
    declare session?: string;
    declare role: typeof UserRoles[number];
    declare pasetoSecret?: string;
    declare resetToken?: string;
    declare lastRequest?: Date;
    declare readonly createdAt?: Date | string;
    declare readonly updatedAt?: Date | string;

    declare readonly products?: product[];

    declare getProducts: BelongsToManyGetAssociationsMixin<product>;
    declare setProducts: BelongsToManySetAssociationsMixin<product, product['id']>;
    declare addProduct: BelongsToManyAddAssociationMixin<product, product['id']>;
    declare addProducts: BelongsToManyAddAssociationsMixin<product, product['id']>;
    declare removeProduct: BelongsToManyRemoveAssociationMixin<product, product['id']>;
    declare removeProducts: BelongsToManyRemoveAssociationsMixin<product, product['id']>;
    declare countProducts: BelongsToManyCountAssociationsMixin;

    declare static associations: {
        products: Association<user, product>;
    }
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes): ModelExport<user> => {
    user.init(
        {
            id: {
                type: dataTypes.STRING,
                primaryKey: true,
                unique: true,
                defaultValue: dataTypes.UUIDV4,
            },
            username: dataTypes.TEXT,
            passHash: dataTypes.TEXT,
            pasetoSecret: {
                type: dataTypes.TEXT,
                field: 'paseto_secret',
                allowNull: true,
            },
            session: {
                type: dataTypes.TEXT,
                allowNull: true,
            },
            role: {
                type: dataTypes.TEXT,
                validate: {
                    isIn: [[...UserRoles]]
                }
            },
            resetToken: {
                type: dataTypes.TEXT,
                field: 'reset_token',
                allowNull: true,
            },
            lastRequest: {
                type: dataTypes.DATE,
                field: 'last_request',
                allowNull: true,
            }
        },
        {
            sequelize,
            tableName: 'user',
        }
    );

    const associate = (models: ModelMap) => {
        user.hasMany(models.userProduct);
        user.belongsToMany(models.product, { through: models.userProduct });
    };

    return {
        model: user,
        associate,
    };
};
