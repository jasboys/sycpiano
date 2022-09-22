import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface, dataTypes: typeof DataTypes): Promise<void> => {
    await queryInterface.addColumn('calendar',
        'image_url',
        {
            type: dataTypes.STRING,
            allowNull: true,
        },
    );
    await queryInterface.addColumn('calendar',
        'photo_reference',
        {
            type: dataTypes.STRING,
            allowNull: true,
        },
    );
    await queryInterface.addColumn('calendar',
        'place_id',
        {
            type: dataTypes.STRING,
            allowNull: true,
        },
    );
    await queryInterface.addColumn('calendar',
        'use_place_photo',
        {
            type: dataTypes.BOOLEAN,
            defaultValue: true,
        },
    );
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.removeColumn('calendar', 'image_url');
    await queryInterface.removeColumn('calendar', 'photo_reference');
    await queryInterface.removeColumn('calendar', 'place_id');
    await queryInterface.removeColumn('calendar', 'use_place_photo');
};
