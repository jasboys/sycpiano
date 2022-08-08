import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface, _: typeof DataTypes): Promise<void> => {
    await queryInterface.renameColumn(
        'user',
        'email',
        'username'
    );
    await queryInterface.renameColumn(
        'user',
        'hash',
        'pass_hash'
    );
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.renameColumn(
        'user',
        'username',
        'email'
    );
    await queryInterface.renameColumn(
        'user',
        'pass_hash',
        'hash'
    );
};
