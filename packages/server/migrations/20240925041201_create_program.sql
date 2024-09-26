-- migrate:up

CREATE TABLE IF NOT EXISTS program (
    id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nickname         text
);

CREATE TABLE IF NOT EXISTS program_piece (
    id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    program_id       serial REFERENCES program ON DELETE CASCADE,
    piece_id         uuid REFERENCES piece ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS program_piece_program_idx ON program_piece(program_id);
CREATE INDEX IF NOT EXISTS program_piece_piece_idx ON program_piece(piece_id);

-- migrate:down

DROP INDEX IF EXISTS program_piece_piece_idx;
DROP INDEX IF EXISTS program_piece_program_idx;

DROP TABLE IF EXISTS program_piece;
DROP TABLE IF EXISTS program;