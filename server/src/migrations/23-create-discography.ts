import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface, dataTypes: typeof DataTypes): Promise<void> => {
    try {
        await queryInterface.createTable('disc', {
            id: {
                type: dataTypes.UUID,
                defaultValue: dataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
                unique: true,
            },
            title: dataTypes.STRING,
            description: dataTypes.TEXT,
            label: dataTypes.STRING,
            releaseDate: {
                type: dataTypes.INTEGER,
                field: 'release_date',
            },
            thumbnailFile: {
                type: dataTypes.STRING,
                field: 'thumbnail_file',
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
    } catch (e) {
        console.log(e);
    }
    try {
        await queryInterface.createTable('disc_link', {
            id: {
                type: dataTypes.UUID,
                defaultValue: dataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
                unique: true,
            },
            type: dataTypes.STRING,
            url: dataTypes.STRING,
            discId: {
                type: dataTypes.UUID,
                field: 'disc_id',
                allowNull: false,
                references: {
                    model: 'disc',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
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
    } catch (e) {
        console.log(e);
    }
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.dropTable('disc_link');
    await queryInterface.dropTable('disc');
};
