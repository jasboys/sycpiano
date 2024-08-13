-- migrate:up

ALTER TABLE calendar
    ADD COLUMN IF NOT EXISTS image_url text,
    ADD COLUMN IF NOT EXISTS photo_reference text,
    ADD COLUMN IF NOT EXISTS place_id text,
    ADD COLUMN IF NOT EXISTS use_place_photo boolean DEFAULT true;

-- migrate:down

ALTER TABLE calendar
    DROP COLUMN IF EXISTS image_url,
    DROP COLUMN IF EXISTS photo_reference,
    DROP COLUMN IF EXISTS place_id,
    DROP COLUMN IF EXISTS use_place_photo;