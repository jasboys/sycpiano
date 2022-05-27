import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface, dataTypes: typeof DataTypes): Promise<void> => {
    await queryInterface.createTable('product', {
        id: {
            type: dataTypes.STRING,
            primaryKey: true,
            unique: true,
        },
        name: dataTypes.STRING,
        file: dataTypes.STRING,
        description: dataTypes.TEXT,
        sample: dataTypes.STRING,
        images: dataTypes.ARRAY(dataTypes.STRING),
        pages: dataTypes.INTEGER,
        price: dataTypes.INTEGER,
        type: dataTypes.STRING,
        priceID: {
            type: dataTypes.STRING,
            field: 'price_id',
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
    await queryInterface.dropTable('product');
};
