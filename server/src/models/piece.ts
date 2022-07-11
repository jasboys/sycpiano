import { BelongsToManyCountAssociationsMixin, BelongsToManyGetAssociationsMixin, DataTypes, Model, Sequelize } from 'sequelize';
import { ModelExport, ModelMap } from '../types';
import { calendar } from './calendar';
import { calendarPiece } from './calendarPiece';

export interface PieceAttributes {
    id: string;
    composer: string;
    piece: string;
    readonly _search: string;
}

export interface PieceCreationAttributes extends Omit<PieceAttributes, 'id' | '_search'> {}

export class piece extends Model<PieceAttributes, PieceCreationAttributes> implements PieceAttributes {
    declare id: string;
    declare composer: string;
    declare piece: string;
    declare readonly _search: string;
    declare readonly createdAt?: Date | string;
    declare readonly updatedAt?: Date | string;
    declare readonly calendarPiece?: calendarPiece;

    declare countCalendars: BelongsToManyCountAssociationsMixin;
    declare getCalendars: BelongsToManyGetAssociationsMixin<calendar>;
}

export default (sequelize: Sequelize, dataTypes: typeof DataTypes): ModelExport<piece> => {
    piece.init({
        id: {
            allowNull: false,
            defaultValue: dataTypes.UUIDV4,
            primaryKey: true,
            type: dataTypes.UUID,
            unique: true,
        },
        composer: dataTypes.STRING,
        piece: dataTypes.STRING,
        _search: dataTypes.STRING,
    }, {
            sequelize,
            tableName: 'piece',
        });

    const associate = (models: ModelMap) => {
        piece.hasMany(models.calendarPiece);
        piece.belongsToMany(models.calendar, { through: models.calendarPiece });
    };

    return {
        model: piece,
        associate,
    };
};
