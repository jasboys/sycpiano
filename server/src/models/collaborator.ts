import { BelongsToManyCountAssociationsMixin, DataTypes, Model, Sequelize } from 'sequelize';
import { ModelMap, ModelExport } from '../types';
import { calendarCollaborator } from './calendarCollaborator';

export interface CollaboratorAttributes {
    id: string;
    name: string;
    instrument: string;
    _search: string;
}

export interface CollaboratorCreationAttributes extends Omit<CollaboratorAttributes, 'id' | '_search'> {}

export class collaborator extends Model<CollaboratorAttributes, CollaboratorCreationAttributes> implements CollaboratorAttributes {
    declare id: string;
    declare name: string;
    declare instrument: string;
    declare readonly _search: string;
    declare readonly createdAt?: Date | string;
    declare readonly updatedAt?: Date | string;
    declare readonly calendarCollaborator?: calendarCollaborator;

    declare countCalendars: BelongsToManyCountAssociationsMixin;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes): ModelExport<collaborator> => {
    collaborator.init({
        id: {
            allowNull: false,
            defaultValue: dataTypes.UUIDV4,
            primaryKey: true,
            type: dataTypes.UUID,
            unique: true,
        },
        name: dataTypes.STRING,
        instrument: dataTypes.STRING,
        _search: dataTypes.STRING,
    }, {
        sequelize,
        tableName: 'collaborator',
    });

    const associate = (models: ModelMap) => {
        collaborator.hasMany(models.calendarCollaborator);
        collaborator.belongsToMany(models.calendar, { through: models.calendarCollaborator });
    };

    return {
        model: collaborator,
        associate,
    };
};
