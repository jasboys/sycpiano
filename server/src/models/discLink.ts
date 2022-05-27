import { DataTypes, Model, Sequelize } from 'sequelize';
import { ModelExport, ModelMap } from '../types';

export interface DiscLinkAttributes {
    id: string;
    type: string;
    url: string;
    discId: string;
}

export interface DiscLinkCreationAttributes extends Omit<DiscLinkAttributes, 'id'> {}

export class discLink extends Model<DiscLinkAttributes, DiscLinkCreationAttributes> implements DiscLinkAttributes {
    declare id: string;
    declare type: string;
    declare url: string;
    declare discId: string;
    declare readonly createdAt?: Date | string;
    declare readonly updatedAt?: Date | string;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes): ModelExport<discLink> => {
    discLink.init({
        id: {
            type: dataTypes.UUID,
            defaultValue: dataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        type: dataTypes.STRING,
        url: dataTypes.STRING,
        discId: {
            type: dataTypes.UUID,
            field: 'disc_id',
        },
    }, {
        sequelize,
        tableName: 'disc_link',
    });

    const associate = (models: ModelMap) => {
        discLink.belongsTo(models.disc);
    };

    return {
        model: discLink,
        associate,
    };
};
