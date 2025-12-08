-- migrate:up

ALTER TABLE calendar
    ADD COLUMN IF NOT EXISTS image_url TEXT;

-- migrate:down

