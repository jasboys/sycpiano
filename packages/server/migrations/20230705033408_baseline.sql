-- migrate:up

-- includes basic definitions from sycpiano v2.0, with modifications
-- should allow new tables to be created easily.

CREATE TABLE IF NOT EXISTS acclaim (
    id               serial PRIMARY KEY,
    quote            text,
    short            text,
    author           text,
    short_author     text,
    date             date,
    website          text,
    has_full_date    boolean NOT NULL
);

CREATE TABLE IF NOT EXISTS calendar (
    id               text PRIMARY KEY,
    name             text NOT NULL,
    date_time        timestamp with time zone NOT NULL,
    all_day          boolean DEFAULT false,
    end_date         date,
    timezone         text DEFAULT current_setting('TIMEZONE'),
    location         text NOT NULL,
    "type"           text NOT NULL,
    website          text,
    image_url        text
);

CREATE INDEX IF NOT EXISTS calendar_time ON calendar (date_time);

CREATE TABLE IF NOT EXISTS piece (
    id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    piece            text,
    composer         text
);

CREATE TABLE IF NOT EXISTS collaborator (
    id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name             text,
    instrument       text
);

CREATE TABLE IF NOT EXISTS calendar_piece (
    id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    calendar_id      text REFERENCES calendar ON DELETE CASCADE,
    piece_id         uuid REFERENCES piece ON DELETE CASCADE,
    "order"          integer
);

CREATE TABLE IF NOT EXISTS calendar_collaborator (
    id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    calendar_id      text REFERENCES calendar ON DELETE CASCADE,
    collaborator_id  uuid REFERENCES collaborator ON DELETE CASCADE,
    "order"          integer
);

CREATE INDEX IF NOT EXISTS calendar_piece_calendar_idx ON calendar_piece(calendar_id);
CREATE INDEX IF NOT EXISTS calendar_piece_piece_idx ON calendar_piece(piece_id);
CREATE INDEX IF NOT EXISTS calendar_collaborator_calendar_idx ON calendar_collaborator(calendar_id);
CREATE INDEX IF NOT EXISTS calendar_collaborator_collaborator_idx ON calendar_collaborator(collaborator_id);

CREATE TABLE IF NOT EXISTS music (
    id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    composer         text NOT NULL,
    piece            text NOT NULL,
    contributors     text,
    "type"           text NOT NULL,
    year             integer
);

CREATE TABLE IF NOT EXISTS music_file (
    id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name             text,
    audio_file       text NOT NULL,
    duration_seconds integer NOT NULL,
    music_id         uuid REFERENCES music ON DELETE CASCADE,
    hash             text
);

CREATE TABLE IF NOT EXISTS photo (
    id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    file             text,
    width            integer,
    height           integer,
    thumbnail_width  integer,
    thumbnail_height integer,
    credit           text,
    date_taken       timestamp
);

CREATE TABLE IF NOT EXISTS token (
    id               text PRIMARY KEY,
    token            text NOT NULL,
    expires          timestamp with time zone
);

CREATE TABLE IF NOT EXISTS bio (
    id               SERIAL PRIMARY KEY,
    paragraph        integer,
    text             text NOT NULL
);

CREATE TABLE IF NOT EXISTS disc (
    id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title            text,
    description      text,
    label            text,
    release_date     integer,
    thumbnail_file   text
);

CREATE TABLE IF NOT EXISTS disc_link (
    id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    url              text,
    "type"           text,
    disc_id          uuid REFERENCES disc ON DELETE CASCADE
);


-- migrate:down

DROP TABLE IF EXISTS disc_link;
DROP TABLE IF EXISTS disc;

DROP TABLE IF EXISTS bio;
DROP TABLE IF EXISTS token;
DROP TABLE IF EXISTS photo;
DROP TABLE IF EXISTS music_file;
DROP TABLE IF EXISTS music;

DROP INDEX IF EXISTS calendar_collaborator_collaborator_idx;
DROP INDEX IF EXISTS calendar_collaborator_calendar_idx;
DROP INDEX IF EXISTS calendar_piece_piece_idx;
DROP INDEX IF EXISTS calendar_piece_calendar_idx;

DROP TABLE IF EXISTS calendar_collaborator;
DROP TABLE IF EXISTS calendar_piece;
DROP TABLE IF EXISTS collaborator;
DROP TABLE IF EXISTS piece;

DROP INDEX IF EXISTS calendar_time;

DROP TABLE IF EXISTS calendar;
DROP TABLE IF EXISTS acclaim;