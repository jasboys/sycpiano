import { DataTypes, Model, Sequelize } from 'sequelize';
import { ModelExport } from '../types';

export interface TokenAttributes {
    id: string;
    token: string;
    expires?: Date | string;
}

export interface TokenCreationAttributes extends TokenAttributes {}

export class token extends Model<TokenAttributes, TokenCreationAttributes> implements TokenAttributes {
    declare id: string;
    declare token: string;
    declare expires?: Date | string;
    declare readonly createdAt?: Date | string;
    declare readonly updatedAt?: Date | string;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes): ModelExport<token> => {
    token.init({
        id: {
            type: dataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        token: dataTypes.STRING,
        expires: {
            type: dataTypes.DATE,
            allowNull: true,
        },
    }, {
        sequelize,
        tableName: 'token',
    });

    return { model: token };
};
