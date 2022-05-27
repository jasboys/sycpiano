import { DataTypes, Model, Sequelize } from 'sequelize';
import { ModelExport } from '../types';

export interface FaqAttributes {
    id: string;
    order: number;
    question: string;
    answer: string;
}

export interface FaqCreationAttributes extends Omit<FaqAttributes, 'id'> {}

export class faq extends Model<FaqAttributes, FaqCreationAttributes> implements FaqAttributes {
    declare id: string;
    declare order: number;
    declare question: string;
    declare answer: string;
    declare readonly createdAt?: Date | string;
    declare readonly updatedAt?: Date | string;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes): ModelExport<faq> => {
    faq.init({
        id: {
            type: dataTypes.UUID,
            defaultValue: dataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        order: dataTypes.INTEGER,
        question: dataTypes.TEXT,
        answer: dataTypes.TEXT,
    }, {
        sequelize,
        tableName: 'faq',
    });

    return { model: faq };
};
