import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface, _: typeof DataTypes): Promise<void> => {
    await queryInterface.renameTable('customer', 'user');
    await queryInterface.renameTable('customer_product', 'user_product');
    await queryInterface.renameColumn('user_product', 'customer_id', 'user_id');
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.renameTable('user_product', 'customer_product');
    await queryInterface.renameColumn('customer_product', 'user_id', 'customer_id');
    await queryInterface.renameTable('user', 'customer');
};
