import { QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
    // Create the custom function (see migration "21-make-calendar-searchable" and "22-create-aggregate-tsvector")
    // to search the calendar events.
    const alters = [
        'ALTER TABLE piece ALTER COLUMN id SET DEFAULT uuid_generate_v4()',
        'ALTER TABLE collaborator ALTER COLUMN id SET DEFAULT uuid_generate_v4()',
        'ALTER TABLE calendar_piece ALTER COLUMN id SET DEFAULT uuid_generate_v4()',
        'ALTER TABLE calendar_collaborator ALTER COLUMN id SET DEFAULT uuid_generate_v4()',
        'ALTER TABLE music ALTER COLUMN id SET DEFAULT uuid_generate_v4()',
        'ALTER TABLE music_file ALTER COLUMN id SET DEFAULT uuid_generate_v4()',
        'ALTER TABLE photo ALTER COLUMN id SET DEFAULT uuid_generate_v4()',
        'ALTER TABLE disc ALTER COLUMN id SET DEFAULT uuid_generate_v4()',
        'ALTER TABLE disc_link ALTER COLUMN id SET DEFAULT uuid_generate_v4()',
        'ALTER TABLE customer_product ALTER COLUMN id SET DEFAULT uuid_generate_v4()',
        'ALTER TABLE faq ALTER COLUMN id SET DEFAULT uuid_generate_v4()',
    ];
    await Promise.all(alters.map((query) => queryInterface.sequelize.query(query)));
};

export const down = async (_: QueryInterface): Promise<void> => {
    // await queryInterface.sequelize.query(`

    // `);
    return Promise.resolve();
};
