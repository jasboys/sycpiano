import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface, dataTypes: typeof DataTypes): Promise<void> => {
    await queryInterface.addColumn('user',
        'role',
        {
            type: dataTypes.TEXT,
        },
    );
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeColumn('user', 'role');
};