import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface, dataTypes: typeof DataTypes): Promise<void> => {
    await queryInterface.createTable('photo', {
        id: {
            type: dataTypes.UUID,
            defaultValue: dataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false,
            unique: true,
        },
        file: dataTypes.TEXT,
        width: dataTypes.INTEGER,
        height: dataTypes.INTEGER,
        thumbnailWidth: {
            type: dataTypes.INTEGER,
            field: 'thumbnail_width',
        },
        thumbnailHeight: {
            type: dataTypes.INTEGER,
            field: 'thumbnail_height',
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
    await queryInterface.dropTable('photo');
};
