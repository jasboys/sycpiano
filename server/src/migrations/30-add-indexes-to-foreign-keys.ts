import { QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
    // Create the custom function (see migration "21-make-calendar-searchable" and "22-create-aggregate-tsvector")
    // to search the calendar events.
    await queryInterface.sequelize.query(`
        CREATE INDEX calendar_piece_calendar_idx ON "public"."calendar_piece"("calendar_id");
        CREATE INDEX calendar_piece_piece_idx ON "public"."calendar_piece"("piece_id");
        CREATE INDEX calendar_collaborator_calendar_idx ON "public"."calendar_collaborator"("calendar_id");
        CREATE INDEX calendar_collaborator_collaborator_idx ON "public"."calendar_collaborator"("collaborator_id");
        CREATE INDEX customer_product_customer_idx ON "public"."customer_product"("customer_id");
        CREATE INDEX customer_product_product_idx ON "public"."customer_product"("product_id");
        CREATE INDEX disc_link_disc_idx ON "public"."disc_link"("disc_id");
        CREATE INDEX music_file_music_idx ON "public"."music_file"("music_id");

        COMMENT ON COLUMN "public"."music_file"."music" IS E'@name music_temp\n@omit many';
        COMMENT ON CONSTRAINT "music_file_music_id_fkey" ON "public"."music_file" IS E'@fieldName music';
    `);
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.sequelize.query(`
        DROP INDEX IF EXISTS calendar_piece_calendar_idx;
        DROP INDEX IF EXISTS calendar_piece_piece_idx;
        DROP INDEX IF EXISTS calendar_collaborator_calendar_idx;
        DROP INDEX IF EXISTS calendar_collaborator_collaborator_idx;
        DROP INDEX IF EXISTS customer_product_customer_idx;
        DROP INDEX IF EXISTS customer_product_product_idx;
        DROP INDEX IF EXISTS disc_link_disc_idx;
        DROP INDEX IF EXISTS music_file_music_idx;

        COMMENT ON COLUMN "public"."music_file"."music_id" IS NULL;
        COMMENT ON CONSTRAINT "music_file_music_id_fkey" ON "public"."music_file" IS NULL;
    `);
};
