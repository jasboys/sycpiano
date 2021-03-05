import { DataTypes, Sequelize } from 'sequelize';
import { Model } from '../types';

export class bio extends Model {
    readonly paragraph!: number;
    readonly text!: string;
    readonly createdAt?: Date | string;
    readonly updatedAt?: Date | string;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes): typeof bio => {
    bio.init({
        paragraph: {
            type: dataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
        },
        text: {
            type: dataTypes.TEXT,
            allowNull: false,
        },
        createdAt: {
            type: dataTypes.DATE,
            field: 'created_at',
        },
        updatedAt: {
            type: dataTypes.DATE,
            field: 'updated_at',
        },
    }, {
            sequelize,
            tableName: 'bio',
        });
    return bio;
};
