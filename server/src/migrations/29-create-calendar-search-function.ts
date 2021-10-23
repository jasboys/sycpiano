import { QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
    // Create the custom function (see migration "21-make-calendar-searchable" and "22-create-aggregate-tsvector")
    // to search the calendar events.
    await queryInterface.sequelize.query(`
        CREATE FUNCTION calendar_search(search text) returns setof "calendar" AS $$
        WITH filtered_ids AS (
            SELECT
                "calendar".id AS "id"
            FROM "calendar" AS "calendar"
            LEFT OUTER JOIN (
                "calendar_collaborator" AS "collaborators->calendarCollaborator"
                INNER JOIN "collaborator" AS "collaborators"
                    ON "collaborators"."id" = "collaborators->calendarCollaborator"."collaborator_id"
            ) ON "calendar"."id" = "collaborators->calendarCollaborator"."calendar_id"
            LEFT OUTER JOIN (
                "calendar_piece" AS "pieces->calendarPiece"
                INNER JOIN "piece" AS "pieces"
                    ON "pieces"."id" = "pieces->calendarPiece"."piece_id"
            ) ON "calendar"."id" = "pieces->calendarPiece"."calendar_id"
            GROUP BY "calendar"."id"
            HAVING (tsvector_agg(coalesce("collaborators"."_search", '')) || tsvector_agg(coalesce("pieces"."_search", '')) || ("calendar"."_search")) @@ to_tsquery('en', search)
        )
        SELECT * FROM "calendar" AS "calendar"
        WHERE "calendar".id IN (SELECT "id" FROM filtered_ids);
        $$ LANGUAGE SQL STABLE;
    `);
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
    await queryInterface.sequelize.query(`
        DROP FUNCTION IF EXISTS calendar_search(text);
    `);
};
