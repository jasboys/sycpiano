import { Sequelize, DataTypes } from "sequelize";
import { CalendarModel } from "types";

const Calendar = (sequelize: Sequelize, DataTypes: DataTypes) => (
    sequelize.define('calendar', {
        id: {
            allowNull: false,
            autoIncrement: false,
            primaryKey: true,
            type: DataTypes.STRING,
            unique: true,
        },
        name: DataTypes.STRING,
        dateTime: DataTypes.DATE,
        timezone: DataTypes.STRING,
        location: DataTypes.STRING,
        collaborators: DataTypes.JSON,
        type: DataTypes.JSON,
        program: DataTypes.JSON,
    }) as CalendarModel
);

export default Calendar;
