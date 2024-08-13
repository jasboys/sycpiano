-- migrate:up

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

-- migrate:down

DROP TRIGGER IF EXISTS music_trigger ON music;
DROP FUNCTION IF EXISTS music_update_propagate_hash;

DROP TRIGGER IF EXISTS music_file_trigger ON music_file;
DROP FUNCTION IF EXISTS music_file_update_hash;
DROP FUNCTION IF EXISTS get_music_file_hash;

DROP EXTENSION IF EXISTS pgcrypto;

DROP FUNCTION IF EXISTS normalize_and_unaccent;
DROP FUNCTION IF EXISTS get_last_name;
