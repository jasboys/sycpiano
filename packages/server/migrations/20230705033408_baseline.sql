-- migrate:up

-- includes basic definitions from sycpiano v2.0, with modifications

CREATE TABLE IF NOT EXISTS acclaim (
    id              serial PRIMARY KEY,
    quote           text,
    short           text,
    author          text,
    short_author    text,
    date            date,
    website         text,
    has_full_date   boolean NOT NULL
);

CREATE TABLE IF NOT EXISTS calendar (
    id              text PRIMARY KEY,
    name            text,
    date_time       timestamp with time zone,
    all_day         boolean DEFAULT false,
    end_date        date,
    timezone        text,
    location        text,
    type            text,
    website         text,
    image_url       text,
    photo_reference text,
    place_id        text,
    use_place_photo boolean DEFAULT true,
    _search         tsvector
);

CREATE TABLE IF NOT EXISTS piece (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    piece           text,
    composer        text,
    _search         tsvector
);

CREATE TABLE IF NOT EXISTS collaborator (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name            text,
    collaborator    text,
    _search         tsvector
);

CREATE TABLE IF NOT EXISTS calendar_piece (
    calendar_id     text REFERENCES calendar ON DELETE CASCADE,
    piece_id        uuid REFERENCES piece ON DELETE CASCADE,
    "order"         integer,
    PRIMARY KEY (calendar_id, piece_id)
);

CREATE TABLE IF NOT EXISTS calendar_collaborator (
    calendar_id     text REFERENCES calendar ON DELETE CASCADE,
    collaborator_id uuid REFERENCES collaborator ON DELETE CASCADE,
    "order"         integer,
    PRIMARY KEY (calendar_id, collaborator_id)
);

CREATE TABLE IF NOT EXISTS music (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    composer        text,
    piece           text,
    contributors    text,
    type            text,
    year            integer,
    hash            text
);

CREATE TABLE IF NOT EXISTS music_file (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name            text,
    audio_file      text,
    waveform_file   text,
    duration_seconds integer,
    music_id        uuid REFERENCES music ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS photo (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    file            text,
    width           integer,
    height          integer,
    thumbnail_width integer,
    thumbnail_height integer,
    credit          text
);

CREATE TABLE IF NOT EXISTS token (
    id              text PRIMARY KEY,
    token           text,
    expires         timestamp with time zone
);

CREATE TABLE IF NOT EXISTS bio (
    paragraph       integer PRIMARY KEY,
    text            text NOT NULL
);


CREATE EXTENSION IF NOT EXISTS unaccent;

DO $$
    BEGIN
        CREATE TEXT SEARCH CONFIGURATION en ( COPY = simple );
        ALTER TEXT SEARCH CONFIGURATION en
            ALTER MAPPING FOR hword, hword_part, word
            WITH unaccent;
    EXCEPTION
        WHEN unique_violation THEN
            NULL;
    END;
$$;

CREATE INDEX IF NOT EXISTS calendar_search ON calendar USING GIN (_search);
CREATE INDEX IF NOT EXISTS collaborator_search ON collaborator USING GIN (_search);
CREATE INDEX IF NOT EXISTS piece_search ON piece USING GIN (_search);

CREATE TABLE IF NOT EXISTS disc (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title           text,
    description     text,
    label           text,
    release_date    integer,
    thumbnail_file  text
);

CREATE TABLE IF NOT EXISTS disc_link (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    url             text,
    type            text,
    disc_id         uuid REFERENCES disc ON DELETE CASCADE
);


-- migrate:down

-- DROP TABLE IF EXISTS disc_link;
-- DROP TABLE IF EXISTS disc;

-- DROP INDEX IF EXISTS piece_search;
-- DROP INDEX IF EXISTS collaborator_search;
-- DROP INDEX IF EXISTS calendar_search;

-- DROP TEXT SEARCH CONFIGURATION IF EXISTS en;

-- DROP TABLE IF EXISTS bio;
-- DROP TABLE IF EXISTS token;
-- DROP TABLE IF EXISTS photo;
-- DROP TABLE IF EXISTS music_file;
-- DROP TABLE IF EXISTS music;
-- DROP TABLE IF EXISTS calendar_collaborator;
-- DROP TABLE IF EXISTS calendar_piece;
-- DROP TABLE IF EXISTS collaborator;
-- DROP TABLE IF EXISTS piece;
-- DROP TABLE IF EXISTS calendar;

-- DROP TABLE IF EXISTS acclaim;