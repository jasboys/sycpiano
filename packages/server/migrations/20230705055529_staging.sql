-- migrate:up

CREATE TABLE IF NOT EXISTS product (
    id              text PRIMARY KEY,
    name            text,
    file            text,
    description     text,
    sample          text,
    images          text[],
    pages           integer,
    price           integer,
    type            text,
    price_id        text,
    permalink       text
);

CREATE TABLE IF NOT EXISTS "user" (
    id              text PRIMARY KEY,
    username        text,
    role            text,
    pass_hash       text,
    paseto_secret   text,
    reset_token     text,
    session         text,
    last_request    timestamp with time zone
);

CREATE TABLE IF NOT EXISTS user_product (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id         text REFERENCES customer ON DELETE CASCADE,
    product_id      text REFERENCES product ON DELETE CASCADE,
    PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS faq (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    question        text,
    answer          text,
    "order"         integer
);

CREATE INDEX IF NOT EXISTS calendar_piece_calendar_idx ON calendar_piece(calendar_id);
CREATE INDEX IF NOT EXISTS calendar_piece_piece_idx ON calendar_piece(piece_id);
CREATE INDEX IF NOT EXISTS calendar_collaborator_calendar_idx ON calendar_collaborator(calendar_id);
CREATE INDEX IF NOT EXISTS calendar_collaborator_collaborator_idx ON calendar_collaborator(collaborator_id);

CREATE INDEX IF NOT EXISTS user_product_user_idx ON user_product(user_id);
CREATE INDEX IF NOT EXISTS user_product_product_idx ON user_product(product_id);

CREATE INDEX IF NOT EXISTS disc_link_disc_idx ON disc_link(disc_id);
CREATE INDEX IF NOT EXISTS music_file_music_idx ON music_file(music_id);

-- migrate:down
