import { BelongsToGetAssociationMixin, BelongsToSetAssociationMixin, DataTypes, Model, Sequelize } from 'sequelize';
import { ModelExport, ModelMap } from '../types';
import { calendar } from './calendar';
import { piece } from './piece';

export interface CalendarPieceAttributes {
    id?: string;
    calendarId?: string;
    pieceId?: string;
    order?: number;
}

export class calendarPiece extends Model<CalendarPieceAttributes, CalendarPieceAttributes> implements CalendarPieceAttributes {
    declare id?: string;
    declare calendarId?: string;
    declare pieceId?: string;
    declare order?: number;
    declare readonly createdAt?: Date | string;
    declare readonly updatedAt?: Date | string;

    declare getCalendar: BelongsToGetAssociationMixin<calendar>;
    declare setPiece: BelongsToSetAssociationMixin<piece, piece['id']>;
    declare getPiece: BelongsToGetAssociationMixin<piece>;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes): ModelExport<calendarPiece> => {
    calendarPiece.init({
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
        pieceId: {
            type: dataTypes.UUID,
            field: 'piece_id',
        },
        order: dataTypes.INTEGER,
    }, {
        sequelize,
        tableName: 'calendar_piece',
    });

    const associate = (models: ModelMap) => {
        calendarPiece.belongsTo(models.calendar);
        calendarPiece.belongsTo(models.piece);
    };

    return {
        model: calendarPiece,
        associate,
    };
};
