import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface, dataTypes: typeof DataTypes): Promise<void> => {
    await queryInterface.addColumn('collaborator',
        'instrument',
        {
            type: dataTypes.STRING,
            allowNull: true,
        });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeColumn('collaborator', 'instrument');
};
