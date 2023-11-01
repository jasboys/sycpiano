-- migrate:up
ALTER TABLE photo
    ADD COLUMN IF NOT EXISTS omit_from_gallery BOOLEAN;

-- migrate:down
ALTER TABLE photo
    DROP COLUMN IF EXISTS omit_from_gallery;
