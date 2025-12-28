-- migrate:up

ALTER TABLE calendar
    ADD COLUMN IF NOT EXISTS "hidden" boolean DEFAULT false;

-- migrate:down

ALTER TABLE calendar
    DROP COLUMN IF EXISTS "hidden";
