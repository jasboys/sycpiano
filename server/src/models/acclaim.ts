import { DataTypes, Model, Sequelize } from 'sequelize';
import { ModelExport } from '../types';

export interface AcclaimAttributes {
    readonly id: string;
    readonly quote: string;
    readonly short?: string;
    readonly author: string;
    readonly shortAuthor?: string;
    readonly date: Date | string;
    readonly oldDate?: string;
    readonly hasFullDate?: boolean;
    readonly website?: string;
}

export interface AcclaimCreationAttributes extends Omit<AcclaimAttributes, 'id'> {}

export class acclaim extends Model<AcclaimAttributes, AcclaimCreationAttributes> implements AcclaimAttributes {
    declare id: string;
    declare quote: string;
    declare short?: string;
    declare author: string;
    declare shortAuthor?: string;
    declare date: Date | string;
    declare oldDate?: string;
    declare hasFullDate?: boolean;
    declare website?: string;
    declare readonly createdAt?: Date | string;
    declare readonly updatedAt?: Date | string;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes): ModelExport<acclaim> => {
    acclaim.init({
        id: {
            type: dataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        quote: dataTypes.TEXT,
        short: dataTypes.TEXT,
        author: dataTypes.STRING,
        shortAuthor: {
            type: dataTypes.STRING,
            field: 'short_author',
        },
        website: dataTypes.STRING,
        date: dataTypes.DATEONLY,
        oldDate: {
            type: dataTypes.STRING,
            field: 'old_date',
        },
        hasFullDate: {
            type: dataTypes.BOOLEAN,
            field: 'has_full_date',
        },
    }, {
            sequelize,
            tableName: 'acclaim',
        });

    return {
        model: acclaim,
    };
};
