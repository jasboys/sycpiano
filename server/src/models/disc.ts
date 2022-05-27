import { DataTypes, HasManyGetAssociationsMixin, Model, Sequelize } from 'sequelize';
import { ModelExport, ModelMap } from '../types';
import { discLink } from './discLink';

export interface DiscAttributes {
    id?: string;
    title: string;
    description: string;
    label: string;
    releaseDate: Date | string;
    thumbnailFile: string;
}

export interface DiscCreationAttributes extends Omit<DiscAttributes, 'id'> {}

export class disc extends Model<DiscAttributes, DiscCreationAttributes> implements DiscAttributes {
    declare id: string;
    declare title: string;
    declare description: string;
    declare label: string;
    declare releaseDate: Date | string;
    declare thumbnailFile: string;
    declare readonly createdAt?: Date | string;
    declare readonly updatedAt?: Date | string;

    declare readonly getDiscLinks: HasManyGetAssociationsMixin<discLink>;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes): ModelExport<disc> => {
    disc.init({
        id: {
            type: dataTypes.UUID,
            defaultValue: dataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        title: dataTypes.STRING,
        description: dataTypes.STRING,
        label: dataTypes.STRING,
        releaseDate: {
            type: dataTypes.INTEGER,
            field: 'release_date',
        },
        thumbnailFile: {
            type: dataTypes.STRING,
            field: 'thumbnail_file',
        },
    }, {
        sequelize,
        tableName: 'disc',
    });

    const associate = (models: ModelMap) => {
        disc.hasMany(models.discLink);
    };

    return {
        model: disc,
        associate,
    };
};
