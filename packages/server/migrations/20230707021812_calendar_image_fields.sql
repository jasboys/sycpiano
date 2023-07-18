-- migrate:up

ALTER TABLE calendar
    ADD COLUMN IF NOT EXISTS image_url text,
    ADD COLUMN IF NOT EXISTS photo_reference text,
    ADD COLUMN IF NOT EXISTS place_id text,
    ADD COLUMN IF NOT EXISTS use_place_photo boolean DEFAULT true;

-- migrate:down

