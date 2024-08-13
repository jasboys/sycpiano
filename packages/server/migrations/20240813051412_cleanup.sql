-- migrate:up

ALTER TABLE calendar
    DROP COLUMN IF EXISTS image_url,
    DROP COLUMN IF EXISTS photo_reference,
    DROP COLUMN IF EXISTS place_id,
    DROP COLUMN IF EXISTS use_place_photo;

DROP TRIGGER IF EXISTS cal_refresh ON calendar;
DROP TRIGGER IF EXISTS piece_refresh ON piece;
DROP TRIGGER IF EXISTS collab_refresh on collaborator;
DROP TRIGGER IF EXISTS calcollab_refresh on calendar_collaborator;
DROP TRIGGER IF EXISTS calpiece_refresh on calendar_piece;

DROP FUNCTION IF EXISTS refresh_search_matview;

DROP INDEX IF EXISTS search_idx;

DROP MATERIALIZED VIEW IF EXISTS calendar_search_matview;

DROP INDEX IF EXISTS collaborator_trgm;
DROP INDEX IF EXISTS piece_trgm;
DROP INDEX IF EXISTS calendar_trgm_id;
DROP INDEX IF EXISTS calendar_trgm_gist_idx;
DROP INDEX IF EXISTS pg_trgm;

DROP MATERIALIZED VIEW IF EXISTS calendar_trgm_matview;

DROP FUNCTION IF EXISTS immutable_concat_ws;

DROP AGGREGATE IF EXISTS tsvector_agg(tsvector);

ALTER TABLE calendar_piece
    DROP CONSTRAINT IF EXISTS calendar_piece_id_key;

ALTER TABLE calendar_collaborator
    DROP CONSTRAINT IF EXISTS calendar_collaborator_id_key;

DROP TABLE IF EXISTS migrations;
DROP TABLE IF EXISTS seeders;

ALTER INDEX IF EXISTS customer_pkey RENAME TO user_pkey;

-- migrate:down

-- I don't think we need to migrate down for this