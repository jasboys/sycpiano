import { DataTypes, Model, Sequelize } from 'sequelize';
import { ModelExport } from '../types';

export interface PhotoAttributes {
    id: string;
    file: string;
    credit?: string;
    width: number;
    height: number;
    thumbnailWidth: number;
    thumbnailHeight: number;
}

export interface PhotoCreationAttributes extends Omit<PhotoAttributes, 'id'> {}

export class photo extends Model<PhotoAttributes, PhotoCreationAttributes> implements PhotoAttributes {
    declare id: string;
    declare file: string;
    declare credit?: string;
    declare width: number;
    declare height: number;
    declare thumbnailWidth: number;
    declare thumbnailHeight: number;
    declare readonly createdAt?: Date | string;
    declare readonly updatedAt?: Date | string;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes): ModelExport<photo> => {
    photo.init({
        id: {
            type: dataTypes.UUID,
            defaultValue: dataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        file: dataTypes.STRING,
        credit: dataTypes.STRING,
        width: dataTypes.INTEGER,
        height: dataTypes.INTEGER,
        thumbnailWidth: {
            type: dataTypes.INTEGER,
            field: 'thumbnail_width',
        },
        thumbnailHeight: {
            type: dataTypes.INTEGER,
            field: 'thumbnail_height',
        },
    }, {
        sequelize,
        tableName: 'photo',
    });

    return { model: photo };
};
