import { DataTypes, Model, Sequelize } from 'sequelize';
import { ModelExport } from '../types';

export interface BioAttributes {
    id: number;
    paragraph: number;
    text: string;
}

export interface BioCreateAttributes extends Omit<BioAttributes, 'id'> {}

export class bio extends Model<BioAttributes, BioCreateAttributes> implements BioAttributes {
    declare id: number;
    declare paragraph: number;
    declare text: string;
    declare readonly createdAt?: Date | string;
    declare readonly updatedAt?: Date | string;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes): ModelExport<bio> => {
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
        id: {
            type: dataTypes.VIRTUAL,
            get() {
                return this.paragraph;
            },
            set() {
                return;
            },
        },
    }, {
            sequelize,
            tableName: 'bio',
        });

    return { model: bio };
};
