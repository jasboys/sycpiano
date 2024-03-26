-- migrate:up
ALTER TABLE product
    ADD COLUMN IF NOT EXISTS purchased_count INTEGER DEFAULT 0;

-- migrate:down
ALTER TABLE product
    DROP COLUMN IF EXISTS purchased_count;
