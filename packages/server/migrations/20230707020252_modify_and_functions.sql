-- migrate:up

-- remove old triggers

DROP TRIGGER IF EXISTS calendar_vector_update ON calendar;
DROP TRIGGER IF EXISTS piece_vector_update ON piece;
DROP TRIGGER IF EXISTS collaborator_vector_update ON collaborator;

-- remove old indexes

DROP INDEX IF EXISTS calendar_search;
DROP INDEX IF EXISTS collaborator_search;
DROP INDEX IF EXISTS piece_search;

-- remove search columns

ALTER TABLE calendar DROP COLUMN _search CASCADE;
ALTER TABLE piece DROP COLUMN _search CASCADE;
ALTER TABLE collaborator DROP COLUMN _search CASCADE;

-- modify varchar -> text if needed

-- first make sure no null "type" columns
UPDATE calendar SET "type" = 'solo' WHERE "type" IS NULL;
UPDATE calendar SET location = 'Kansas City, MO' WHERE location IS NULL;

ALTER TABLE calendar
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at,
    -- ALTER COLUMN id TYPE text,
    ALTER COLUMN all_day SET NOT NULL,
    ALTER COLUMN date_time SET NOT NULL,
    ALTER COLUMN name TYPE text,
    ALTER COLUMN name SET NOT NULL,
    ALTER COLUMN timezone TYPE text,
    ALTER COLUMN timezone SET DEFAULT current_setting('TIMEZONE'),
    ALTER COLUMN location TYPE text,
    ALTER COLUMN location SET NOT NULL,
    ALTER COLUMN "type" TYPE text,
    ALTER COLUMN "type" SET NOT NULL,
    ALTER COLUMN website TYPE text;

ALTER TABLE piece
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at,
    ALTER COLUMN id SET DEFAULT gen_random_uuid(),
    ALTER COLUMN piece TYPE text,
    ALTER COLUMN composer TYPE text;

ALTER TABLE collaborator
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at,
    ALTER COLUMN id SET DEFAULT gen_random_uuid(),
    ALTER COLUMN name TYPE text,
    ALTER COLUMN instrument TYPE text;

DELETE FROM calendar_piece WHERE calendar_id IS NULL OR piece_id IS NULL;
DELETE FROM calendar_collaborator WHERE calendar_id IS NULL OR collaborator_id IS NULL;

ALTER TABLE calendar_piece
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at,
    ALTER COLUMN calendar_id TYPE text,
    DROP CONSTRAINT calendar_piece_pkey,
    ALTER COLUMN id SET DEFAULT gen_random_uuid(),
    ADD PRIMARY KEY (calendar_id, piece_id),
    DROP CONSTRAINT IF EXISTS calendar_piece_calendar_id_fkey,
    ADD CONSTRAINT calendar_piece_calendar_id_fkey
        FOREIGN KEY (calendar_id)
        REFERENCES calendar(id)
        ON DELETE CASCADE,
    DROP CONSTRAINT IF EXISTS calendar_piece_piece_id_fkey,
    ADD CONSTRAINT calendar_piece_piece_id_fkey
        FOREIGN KEY (piece_id)
        REFERENCES piece(id)
        ON DELETE CASCADE;

ALTER TABLE calendar_collaborator
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at,
    ALTER COLUMN calendar_id TYPE text,
    DROP CONSTRAINT calendar_collaborator_pkey,
    ALTER COLUMN id SET DEFAULT gen_random_uuid(),
    ADD PRIMARY KEY (calendar_id, collaborator_id),
    DROP CONSTRAINT IF EXISTS calendar_collaborator_calendar_id_fkey,
    ADD CONSTRAINT calendar_collaborator_calendar_id_fkey
        FOREIGN KEY (calendar_id)
        REFERENCES calendar(id)
        ON DELETE CASCADE,
    DROP CONSTRAINT IF EXISTS calendar_collaborator_collaborator_id_fkey,
    ADD CONSTRAINT calendar_collaborator_collaborator_id_fkey
        FOREIGN KEY (collaborator_id)
        REFERENCES collaborator(id)
        ON DELETE CASCADE;

-- re-create _search columns

-- ALTER TABLE calendar
--     ADD COLUMN _search TSVECTOR
--         GENERATED ALWAYS AS
--             (to_tsvector('en', COALESCE(name, '') || ' ' || COALESCE(location, '') || ' ' || COALESCE(type, ''))) STORED;

-- ALTER TABLE piece
--     ADD COLUMN _search TSVECTOR
--         GENERATED ALWAYS AS
--             (to_tsvector('en', COALESCE(composer, '') || ' ' || COALESCE(piece, ''))) STORED;

-- ALTER TABLE collaborator
--     ADD COLUMN _search TSVECTOR
--         GENERATED ALWAYS AS
--             (to_tsvector('en', COALESCE(name, '') || ' ' || COALESCE(instrument, ''))) STORED;


-- re-create indexes

-- CREATE INDEX IF NOT EXISTS calendar_search ON calendar USING GIN (_search);
-- CREATE INDEX IF NOT EXISTS collaborator_search ON collaborator USING GIN (_search);
-- CREATE INDEX IF NOT EXISTS piece_search ON piece USING GIN (_search);

CREATE INDEX IF NOT EXISTS calendar_time ON calendar (date_time);

-- remake tsvector_agg function

-- CREATE OR REPLACE AGGREGATE tsvector_agg (tsvector) (
--     SFUNC = tsvector_concat,
--     STYPE = tsvector,
--     INITCOND = ''
-- );

-- Use this to join the tsvectors from related rows for calendar

CREATE OR REPLACE FUNCTION immutable_concat_ws(text, VARIADIC text[])
  RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE AS
'SELECT array_to_string($2, $1)';

CREATE MATERIALIZED VIEW IF NOT EXISTS calendar_trgm_matview AS
    SELECT cal.id, (immutable_concat_ws(' ', cal.name, cal.location, cal.type, ccj.doc, cpj.doc)) as doc
        FROM calendar as cal
        LEFT JOIN (
            SELECT cc.calendar_id as id, string_agg(immutable_concat_ws(' ', coll.name, coll.instrument), ' ') as doc
            FROM calendar_collaborator as cc
            INNER JOIN collaborator as coll on cc.collaborator_id = coll.id
            GROUP BY 1
        ) ccj USING (id)
        LEFT JOIN (
            SELECT cp.calendar_id as id, string_agg(immutable_concat_ws(' ', p.composer, p.piece), ' ') as doc
            FROM calendar_piece as cp
            INNER JOIN piece as p on cp.piece_id = p.id
            GROUP BY 1
        ) cpj USING (id)
    WITH DATA;

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX calendar_trgm_gist_idx ON calendar_trgm_matview USING gist(doc gist_trgm_ops);

CREATE UNIQUE INDEX IF NOT EXISTS calendar_trgm_id on calendar_trgm_matview (id);
CREATE INDEX IF NOT EXISTS piece_trgm ON piece USING gist(immutable_concat_ws(' ', composer, piece) gist_trgm_ops);
CREATE INDEX IF NOT EXISTS collaborator_trgm ON collaborator USING gist(immutable_concat_ws(' ', "name", instrument) gist_trgm_ops);

-- CREATE MATERIALIZED VIEW IF NOT EXISTS calendar_search_matview AS
--     SELECT cal.id, (coalesce(ccj._search, '') || coalesce(cpj._search, '') || coalesce(cal._search, '')) as _search
--         FROM calendar as cal
--         LEFT JOIN (
--             SELECT cc.calendar_id as id, tsvector_agg(coll._search) as _search
--             FROM calendar_collaborator as cc
--             INNER JOIN collaborator as coll on cc.collaborator_id = coll.id
--             GROUP BY 1
--         ) ccj USING (id)
--         LEFT JOIN (
--             SELECT cp.calendar_id as id, tsvector_agg(p._search) as _search
--             FROM calendar_piece as cp
--             INNER JOIN piece as p on cp.piece_id = p.id
--             GROUP BY 1
--         ) cpj USING (id)
--     WITH DATA;

-- CREATE UNIQUE INDEX IF NOT EXISTS search_idx ON calendar_search_matview (id);

CREATE OR REPLACE FUNCTION refresh_search_matview() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY calendar_trgm_matview;
    RETURN NULL;
END;
$$;

-- Triggers for refreshing materialized view

CREATE OR REPLACE TRIGGER cal_refresh AFTER
    INSERT OR DELETE OR UPDATE ON calendar
    FOR EACH STATEMENT
    EXECUTE PROCEDURE refresh_search_matview();

CREATE OR REPLACE TRIGGER piece_refresh AFTER
    UPDATE ON piece
    FOR EACH STATEMENT
    EXECUTE PROCEDURE refresh_search_matview();

CREATE OR REPLACE TRIGGER collab_refresh AFTER
    UPDATE ON collaborator
    FOR EACH STATEMENT
    EXECUTE PROCEDURE refresh_search_matview();

CREATE OR REPLACE TRIGGER calcollab_refresh AFTER
    INSERT OR DELETE ON calendar_collaborator
    FOR EACH STATEMENT
    EXECUTE PROCEDURE refresh_search_matview();

CREATE OR REPLACE TRIGGER calpiece_refresh AFTER
    INSERT OR DELETE ON calendar_piece
    FOR EACH STATEMENT
    EXECUTE PROCEDURE refresh_search_matview();

-- Functions and trigger for music_file hash

CREATE OR REPLACE FUNCTION get_last_name(full_name varchar) RETURNS varchar
LANGUAGE plpgsql AS $$
BEGIN
    RETURN (regexp_match(full_name, '([^\s]+)\s?(?:\(.*\))?$'))[1];
END;
$$;

CREATE OR REPLACE FUNCTION normalize_and_unaccent(string varchar) RETURNS varchar
LANGUAGE plpgsql AS $$
DECLARE
    temp varchar;
BEGIN
    select normalize(string, NFD) INTO temp;
    select regexp_replace(temp, '[\u0300-\u036f":()'',.-]', '', 'g') INTO temp;
    select regexp_replace(temp, '\s+', '-', 'g') INTO temp;
    select regexp_replace(temp, '_$', '', 'g') INTO temp;
    RETURN temp;
END;
$$;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION get_music_file_hash(composer varchar, piece varchar, movement varchar = NULL) RETURNS varchar
LANGUAGE plpgsql AS $$
DECLARE
    temp varchar;
    last_name varchar;
    piece_norm varchar;
    movement_norm varchar := '';
BEGIN
    SELECT get_last_name (composer) INTO last_name;
    SELECT normalize_and_unaccent (piece) INTO piece_norm;
    IF movement IS NOT NULL THEN
        SELECT '/' || normalize_and_unaccent (movement) INTO movement_norm;
    END IF;
    SELECT '/' || last_name || '/' || piece_norm || movement_norm INTO temp;
    RETURN encode(digest(temp, 'sha1'), 'base64');
END;
$$;

CREATE OR REPLACE FUNCTION music_file_update_hash() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
    music_row music%ROWTYPE;
    hash_val varchar;
BEGIN
    IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.name <> OLD.name)) THEN
        SELECT * INTO music_row FROM music WHERE music.id = NEW.music_id;
        SELECT get_music_file_hash(music_row.composer, music_row.piece, NEW.name) INTO hash_val;
        NEW.hash := hash_val;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER music_file_trigger
    BEFORE INSERT OR UPDATE ON music_file
    FOR EACH ROW EXECUTE FUNCTION music_file_update_hash();

CREATE OR REPLACE FUNCTION music_update_propagate_hash() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
    mf music_file%ROWTYPE;
BEGIN
    IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (NEW.composer <> OLD.composer OR NEW.piece <> OLD.piece))) THEN
        FOR mf IN
            SELECT * FROM music_file WHERE music_id = NEW.id
        LOOP
            UPDATE music_file SET hash = get_music_file_hash(NEW.composer, NEW.piece, mf.name) WHERE id = mf.id;
        END LOOP;
    END IF;
    RETURN NULL;
END;
$$;

CREATE OR REPLACE TRIGGER music_trigger
    AFTER INSERT OR UPDATE ON music
    FOR EACH ROW EXECUTE FUNCTION music_update_propagate_hash();

ALTER TABLE acclaim
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at;

ALTER TABLE bio
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at,
    DROP CONSTRAINT IF EXISTS bio_pkey,
    ADD COLUMN IF NOT EXISTS id SERIAL;

ALTER TABLE music
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at,
    ALTER COLUMN id SET DEFAULT gen_random_uuid(),
    ALTER COLUMN composer TYPE text,
    ALTER COLUMN composer SET NOT NULL,
    ALTER COLUMN contributors TYPE text,
    ALTER COLUMN piece TYPE text,
    ALTER COLUMN piece SET NOT NULL,
    ALTER COLUMN "type" TYPE text,
    ALTER COLUMN "type" SET NOT NULL;

ALTER TABLE music_file
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at,
    ALTER COLUMN id SET DEFAULT gen_random_uuid(),
    ALTER COLUMN name TYPE text,
    ALTER COLUMN audio_file TYPE text,
    ALTER COLUMN audio_file SET NOT NULL,
    DROP COLUMN IF EXISTS waveform_file,
    ALTER COLUMN duration_seconds SET NOT NULL,
    ALTER COLUMN hash TYPE text,
    DROP CONSTRAINT IF EXISTS music_file_music_id_fkey,
    ADD CONSTRAINT music_file_music_id_fkey
        FOREIGN KEY (music_id)
        REFERENCES music(id)
        ON DELETE CASCADE;

ALTER TABLE photo
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at,
    ALTER COLUMN id SET DEFAULT gen_random_uuid(),
    ADD COLUMN IF NOT EXISTS date_taken timestamp,
    ALTER COLUMN file TYPE text,
    ALTER COLUMN credit TYPE text;

ALTER TABLE token
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at,
    ALTER COLUMN id TYPE text,
    ALTER COLUMN token SET NOT NULL;

ALTER TABLE disc
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at,
    ALTER COLUMN id SET DEFAULT gen_random_uuid(),
    ALTER COLUMN title TYPE text,
    ALTER COLUMN label TYPE text,
    ALTER COLUMN thumbnail_file TYPE text;

ALTER TABLE disc_link
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at,
    ALTER COLUMN id SET DEFAULT gen_random_uuid(),
    ALTER COLUMN "type" TYPE text,
    ALTER COLUMN url TYPE text,
    DROP CONSTRAINT IF EXISTS disc_link_disc_id_fkey,
    ADD CONSTRAINT disc_link_disc_id_fkey
        FOREIGN KEY (disc_id)
        REFERENCES disc(id)
        ON DELETE CASCADE;

ALTER TABLE product
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at,
    ALTER COLUMN id TYPE text,
    ALTER COLUMN name TYPE text,
    ALTER COLUMN name SET NOT NULL,
    ALTER COLUMN price SET NOT NULL,
    ALTER COLUMN file TYPE text,
    ALTER COLUMN file SET NOT NULL,
    ALTER COLUMN sample TYPE text,
    ALTER COLUMN images TYPE text[],
    ALTER COLUMN images SET DEFAULT '{}',
    ALTER COLUMN "type" TYPE text,
    ALTER COLUMN price_id TYPE text,
    ALTER COLUMN price_id SET NOT NULL,
    ALTER COLUMN permalink TYPE text;

ALTER TABLE "user"
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at,
    ALTER COLUMN id TYPE text;

CREATE INDEX IF NOT EXISTS user_username_idx ON "user" (username);

ALTER TABLE user_product
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at,
    ALTER COLUMN user_id TYPE text,
    ALTER COLUMN product_id TYPE text,
    DROP CONSTRAINT IF EXISTS customer_product_customer_id_fkey, -- old naming
    DROP CONSTRAINT IF EXISTS customer_product_product_id_fkey, -- old naming
    DROP CONSTRAINT IF EXISTS user_product_pkey,
    ADD PRIMARY KEY (user_id, product_id),
    DROP CONSTRAINT IF EXISTS user_product_user_id_fkey,
    DROP CONSTRAINT IF EXISTS user_product_product_id_fkey,
    ADD CONSTRAINT user_product_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES "user"(id)
        ON DELETE CASCADE,
    ADD CONSTRAINT user_product_product_id_fkey
        FOREIGN KEY (product_id)
        REFERENCES product(id)
        ON DELETE CASCADE;

DROP INDEX IF EXISTS customer_product_customer_idx;
DROP INDEX IF EXISTS customer_product_product_idx;

CREATE INDEX IF NOT EXISTS user_product_user_idx ON user_product (user_id);
CREATE INDEX IF NOT EXISTS user_product_product_idx ON user_product (product_id);

ALTER TABLE faq
    DROP COLUMN IF EXISTS created_at,
    DROP COLUMN IF EXISTS updated_at,
    ALTER COLUMN id SET DEFAULT gen_random_uuid();

DROP EXTENSION IF EXISTS "uuid-ossp";
-- migrate:down


-- DROP TRIGGER music_trigger ON music;
-- DROP FUNCTION IF EXISTS music_update_propagate_hash;
-- DROP TRIGGER music_file_trigger ON music_file;
-- DROP FUNCTION IF EXISTS music_file_update_hash;

-- DROP FUNCTION IF EXISTS get_music_file_hash;

-- DROP FUNCTION normalize_and_unaccent;
-- DROP FUNCTION get_last_name;

-- DROP TRIGGER calpiece_refresh ON calendar_piece;
-- DROP TRIGGER calcollab_refresh ON calendar_collaborator;
-- DROP TRIGGER collab_refresh ON collaborator;
-- DROP TRIGGER piece_refresh ON piece;
-- DROP TRIGGER cal_refresh ON calendar;

-- DROP FUNCTION IF EXISTS refresh_search_matview;

-- DROP INDEX IF EXISTS search_idx;

-- DROP MATERIALIZED VIEW IF EXISTS calendar_search_matview;

-- CREATE OR REPLACE FUNCTION immutable_concat_ws(text, VARIADIC text[])
-- RETURNS text
-- LANGUAGE internal IMMUTABLE PARALLEL SAFE as
-- 'text_concat_ws';

-- CREATE MATERIALIZED VIEW IF NOT EXISTS calendar_trgm_matview AS
--     SELECT cal.id, (immutable_concat_ws(' ', cal.name, cal.location, cal.type, ccj.doc, cpj.doc)) as doc
--         FROM calendar as cal
--         LEFT JOIN (
--             SELECT cc.calendar_id as id, string_agg(immutable_concat_ws(' ', coll.name, coll.instrument), ' ') as doc
--             FROM calendar_collaborator as cc
--             INNER JOIN collaborator as coll on cc.collaborator_id = coll.id
--             GROUP BY 1
--         ) ccj USING (id)
--         LEFT JOIN (
--             SELECT cp.calendar_id as id, string_agg(immutable_concat_ws(' ', p.composer, p.piece), ' ') as doc
--             FROM calendar_piece as cp
--             INNER JOIN piece as p on cp.piece_id = p.id
--             GROUP BY 1
--         ) cpj USING (id)
--     WITH DATA;

-- create index calendar_trgm_gist_idx on calendar_trgm_matview using gist(doc gist_trgm_ops);

-- explain analyze with trgms as (select id, term <<-> doc as dist from unnest(Array['lig','moz']) term, calendar_trgm_matview order by dist limit 50)
-- select trgms.id, exp(sum(ln(trgms.dist))) from trgms group by trgms.id order by exp;