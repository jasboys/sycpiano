import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface, dataTypes: typeof DataTypes): Promise<void> => {
    await queryInterface.addColumn('customer',
        'email',
        {
            type: dataTypes.TEXT,
        },
    );
    await queryInterface.addColumn('customer',
        'hash',
        {
            type: dataTypes.TEXT,
        },
    );
    await queryInterface.addColumn('customer',
        'paseto_secret',
        {
            type: dataTypes.TEXT,
            allowNull: true,
        },
    );
    await queryInterface.addColumn('customer',
        'reset_token',
        {
            type: dataTypes.TEXT,
            allowNull: true,
        },
    );
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeColumn('customer', 'email');
    await queryInterface.removeColumn('customer', 'hash');
    await queryInterface.removeColumn('customer', 'paseto_secret');
    await queryInterface.removeColumn('customer', 'reset_token');
};
