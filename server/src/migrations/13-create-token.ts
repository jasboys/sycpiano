import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface, dataTypes: typeof DataTypes): Promise<void> => {
    await queryInterface.createTable('token', {
        id: {
            type: dataTypes.STRING,
            allowNull: false,
            primaryKey: true,
        },
        token: dataTypes.TEXT,
        expires: {
            type: dataTypes.DATE,
            allowNull: true,
        },
        createdAt: {
            type: dataTypes.DATE,
            field: 'created_at',
        },
        updatedAt: {
            type: dataTypes.DATE,
            field: 'updated_at',
        },
    });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('token');
};
