import { DataTypes, Model, Sequelize } from 'sequelize';
import { ModelMap, ModelExport } from '../types';

export interface CalendarCollaboratorAttributes {
    id?: string;
    calendarId?: string;
    collaboratorId?: string;
    order?: number;
}

export class calendarCollaborator extends Model<CalendarCollaboratorAttributes, CalendarCollaboratorAttributes> implements CalendarCollaboratorAttributes {
    declare id?: string;
    declare calendarId?: string;
    declare collaboratorId?: string;
    declare order?: number;
    readonly createdAt?: Date | string;
    readonly updatedAt?: Date | string;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes): ModelExport<calendarCollaborator> => {
    calendarCollaborator.init({
        id: {
            allowNull: false,
            defaultValue: dataTypes.UUIDV4,
            primaryKey: true,
            type: dataTypes.UUID,
            unique: true,
        },
        calendarId: {
            type: dataTypes.STRING,
            field: 'calendar_id',
        },
        collaboratorId: {
            type: dataTypes.UUID,
            field: 'collaborator_id',
        },
        order: dataTypes.INTEGER,
    }, {
            sequelize,
            tableName: 'calendar_collaborator',
        });

    const associate = (models: ModelMap) => {
        calendarCollaborator.belongsTo(models.calendar);
        calendarCollaborator.belongsTo(models.collaborator);
    };

    return {
        model: calendarCollaborator,
        associate,
    };
};
