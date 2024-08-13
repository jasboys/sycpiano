-- migrate:up

CREATE TABLE IF NOT EXISTS product (
    id              text PRIMARY KEY,
    name            text NOT NULL,
    file            text NOT NULL,
    description     text,
    sample          text,
    images          text[] DEFAULT '{}',
    pages           integer,
    price           integer NOT NULL,
    "type"          text,
    price_id        text NOT NULL,
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
    user_id         text REFERENCES "user" ON DELETE CASCADE,
    product_id      text REFERENCES product ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS faq (
    id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    question        text,
    answer          text,
    "order"         integer
);

CREATE INDEX IF NOT EXISTS user_username_idx ON "user" (username);

CREATE INDEX IF NOT EXISTS user_product_user_idx ON user_product(user_id);
CREATE INDEX IF NOT EXISTS user_product_product_idx ON user_product(product_id);

CREATE INDEX IF NOT EXISTS disc_link_disc_idx ON disc_link(disc_id);
CREATE INDEX IF NOT EXISTS music_file_music_idx ON music_file(music_id);

-- migrate:down

DROP INDEX IF EXISTS music_file_music_idx;
DROP INDEX IF EXISTS disc_link_disc_idx;

DROP INDEX IF EXISTS user_product_product_idx;
DROP INDEX IF EXISTS user_product_user_idx;

DROP INDEX IF EXISTS user_username_idx;

DROP TABLE IF EXISTS faq;
DROP TABLE IF EXISTS user_product;
DROP TABLE IF EXISTS "user";
DROP TABLE IF EXISTS product;