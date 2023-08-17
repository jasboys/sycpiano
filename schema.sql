SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pg_trgm; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA public;


--
-- Name: EXTENSION pg_trgm; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_trgm IS 'text similarity measurement and index searching based on trigrams';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: unaccent; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA public;


--
-- Name: EXTENSION unaccent; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION unaccent IS 'text search dictionary that removes accents';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: calendar; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendar (
    id text NOT NULL,
    name text NOT NULL,
    date_time timestamp with time zone NOT NULL,
    timezone text DEFAULT current_setting('TIMEZONE'::text),
    location text NOT NULL,
    type text NOT NULL,
    website text,
    all_day boolean DEFAULT false NOT NULL,
    end_date date,
    image_url text,
    photo_reference text,
    place_id text,
    use_place_photo boolean DEFAULT true
);


--
-- Name: calendar_search(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.calendar_search(search text) RETURNS SETOF public.calendar
    LANGUAGE sql STABLE
    AS $$

        WITH filtered_ids AS (

            SELECT

                "calendar".id AS "id"

            FROM "calendar" AS "calendar"

            LEFT OUTER JOIN (

                "calendar_collaborator" AS "collaborators->calendarCollaborator"

                INNER JOIN "collaborator" AS "collaborators"

                    ON "collaborators"."id" = "collaborators->calendarCollaborator"."collaborator_id"

            ) ON "calendar"."id" = "collaborators->calendarCollaborator"."calendar_id"

            LEFT OUTER JOIN (

                "calendar_piece" AS "pieces->calendarPiece"

                INNER JOIN "piece" AS "pieces"

                    ON "pieces"."id" = "pieces->calendarPiece"."piece_id"

            ) ON "calendar"."id" = "pieces->calendarPiece"."calendar_id"

            GROUP BY "calendar"."id"

            HAVING (tsvector_agg(coalesce("collaborators"."_search", '')) || tsvector_agg(coalesce("pieces"."_search", '')) || ("calendar"."_search")) @@ to_tsquery('en', search)

        )

        SELECT * FROM "calendar" AS "calendar"

        WHERE "calendar".id IN (SELECT "id" FROM filtered_ids);

        $$;


--
-- Name: get_last_name(character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_last_name(full_name character varying) RETURNS character varying
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN (regexp_match(full_name, '([^\s]+)\s?(?:\(.*\))?$'))[1];
END;
$_$;


--
-- Name: get_music_file_hash(character varying, character varying, character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.get_music_file_hash(composer character varying, piece character varying, movement character varying DEFAULT NULL::character varying) RETURNS character varying
    LANGUAGE plpgsql
    AS $$
DECLARE
    temp varchar;
    last_name varchar;
    piece_norm varchar;
    movement_norm varchar := '';
BEGIN
    SELECT get_last_name (composer) INTO last_name;
    SELECT normalize_and_unaccent (piece) INTO piece_norm;
    IF movement IS NOT NULL THEN
        SELECT '/' || normalize_and_unaccent (movement) INTO movement_norm;
    END IF;
    SELECT '/' || last_name || '/' || piece_norm || movement_norm INTO temp;
    RETURN encode(digest(temp, 'sha1'), 'base64');
END;
$$;


--
-- Name: immutable_concat_ws(text, text[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.immutable_concat_ws(text, VARIADIC text[]) RETURNS text
    LANGUAGE sql IMMUTABLE PARALLEL SAFE
    AS $_$SELECT array_to_string($2, $1)$_$;


--
-- Name: music_file_update_hash(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.music_file_update_hash() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    music_row music%ROWTYPE;
    hash_val varchar;
BEGIN
    IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.name <> OLD.name)) THEN
        SELECT * INTO music_row FROM music WHERE music.id = NEW.music_id;
        SELECT get_music_file_hash(music_row.composer, music_row.piece, NEW.name) INTO hash_val;
        NEW.hash := hash_val;
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: music_update_propagate_hash(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.music_update_propagate_hash() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    mf music_file%ROWTYPE;
BEGIN
    IF (TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND (NEW.composer <> OLD.composer OR NEW.piece <> OLD.piece))) THEN
        FOR mf IN
            SELECT * FROM music_file WHERE music_id = NEW.id
        LOOP
            UPDATE music_file SET hash = get_music_file_hash(NEW.composer, NEW.piece, mf.name) WHERE id = mf.id;
        END LOOP;
    END IF;
    RETURN NULL;
END;
$$;


--
-- Name: normalize_and_unaccent(character varying); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.normalize_and_unaccent(string character varying) RETURNS character varying
    LANGUAGE plpgsql
    AS $_$
DECLARE
    temp varchar;
BEGIN
    select normalize(string, NFD) INTO temp;
    select regexp_replace(temp, '[\u0300-\u036f":()'',.-]', '', 'g') INTO temp;
    select regexp_replace(temp, '\s+', '-', 'g') INTO temp;
    select regexp_replace(temp, '_$', '', 'g') INTO temp;
    RETURN temp;
END;
$_$;


--
-- Name: refresh_search_matview(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.refresh_search_matview() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY calendar_trgm_matview;
    RETURN NULL;
END;
$$;


--
-- Name: en; Type: TEXT SEARCH CONFIGURATION; Schema: public; Owner: -
--

CREATE TEXT SEARCH CONFIGURATION public.en (
    PARSER = pg_catalog."default" );

ALTER TEXT SEARCH CONFIGURATION public.en
    ADD MAPPING FOR asciiword WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.en
    ADD MAPPING FOR word WITH public.unaccent;

ALTER TEXT SEARCH CONFIGURATION public.en
    ADD MAPPING FOR numword WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.en
    ADD MAPPING FOR email WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.en
    ADD MAPPING FOR url WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.en
    ADD MAPPING FOR host WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.en
    ADD MAPPING FOR sfloat WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.en
    ADD MAPPING FOR version WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.en
    ADD MAPPING FOR hword_numpart WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.en
    ADD MAPPING FOR hword_part WITH public.unaccent;

ALTER TEXT SEARCH CONFIGURATION public.en
    ADD MAPPING FOR hword_asciipart WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.en
    ADD MAPPING FOR numhword WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.en
    ADD MAPPING FOR asciihword WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.en
    ADD MAPPING FOR hword WITH public.unaccent;

ALTER TEXT SEARCH CONFIGURATION public.en
    ADD MAPPING FOR url_path WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.en
    ADD MAPPING FOR file WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.en
    ADD MAPPING FOR "float" WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.en
    ADD MAPPING FOR "int" WITH simple;

ALTER TEXT SEARCH CONFIGURATION public.en
    ADD MAPPING FOR uint WITH simple;


--
-- Name: acclaim; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.acclaim (
    id integer NOT NULL,
    quote text,
    short text,
    author text,
    short_author text,
    website text,
    has_full_date boolean DEFAULT true NOT NULL,
    date date
);


--
-- Name: acclaim_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.acclaim_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: acclaim_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.acclaim_id_seq OWNED BY public.acclaim.id;


--
-- Name: bio; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.bio (
    paragraph integer NOT NULL,
    text text NOT NULL,
    id integer NOT NULL
);


--
-- Name: bio_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.bio_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: bio_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.bio_id_seq OWNED BY public.bio.id;


--
-- Name: calendar_collaborator; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendar_collaborator (
    calendar_id text NOT NULL,
    collaborator_id uuid NOT NULL,
    "order" integer,
    id uuid DEFAULT gen_random_uuid()
);


--
-- Name: calendar_piece; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.calendar_piece (
    calendar_id text NOT NULL,
    piece_id uuid NOT NULL,
    "order" integer,
    id uuid DEFAULT gen_random_uuid()
);


--
-- Name: collaborator; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.collaborator (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text,
    instrument text
);


--
-- Name: piece; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.piece (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    piece text,
    composer text
);


--
-- Name: calendar_trgm_matview; Type: MATERIALIZED VIEW; Schema: public; Owner: -
--

CREATE MATERIALIZED VIEW public.calendar_trgm_matview AS
 SELECT cal.id,
    public.immutable_concat_ws(' '::text, VARIADIC ARRAY[cal.name, cal.location, cal.type, ccj.doc, cpj.doc]) AS doc
   FROM ((public.calendar cal
     LEFT JOIN ( SELECT cc.calendar_id AS id,
            string_agg(public.immutable_concat_ws(' '::text, VARIADIC ARRAY[coll.name, coll.instrument]), ' '::text) AS doc
           FROM (public.calendar_collaborator cc
             JOIN public.collaborator coll ON ((cc.collaborator_id = coll.id)))
          GROUP BY cc.calendar_id) ccj USING (id))
     LEFT JOIN ( SELECT cp.calendar_id AS id,
            string_agg(public.immutable_concat_ws(' '::text, VARIADIC ARRAY[p.composer, p.piece]), ' '::text) AS doc
           FROM (public.calendar_piece cp
             JOIN public.piece p ON ((cp.piece_id = p.id)))
          GROUP BY cp.calendar_id) cpj USING (id))
  WITH NO DATA;


--
-- Name: disc; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.disc (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    title text,
    description text,
    label text,
    release_date integer,
    thumbnail_file text
);


--
-- Name: disc_link; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.disc_link (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    type text,
    url text,
    disc_id uuid NOT NULL
);


--
-- Name: faq; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.faq (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    question text,
    answer text,
    "order" integer
);


--
-- Name: migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.migrations (
    name character varying(255) NOT NULL
);


--
-- Name: music; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.music (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    composer text NOT NULL,
    piece text NOT NULL,
    contributors text,
    type text NOT NULL,
    year integer
);


--
-- Name: music_file; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.music_file (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name text,
    audio_file text NOT NULL,
    duration_seconds integer NOT NULL,
    music_id uuid,
    hash text
);


--
-- Name: photo; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.photo (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    file text,
    width integer,
    height integer,
    thumbnail_width integer,
    thumbnail_height integer,
    credit text
);


--
-- Name: product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.product (
    id text NOT NULL,
    name text NOT NULL,
    file text NOT NULL,
    description text,
    sample text,
    images text[] DEFAULT '{}'::text[],
    pages integer,
    price integer NOT NULL,
    type text,
    price_id text NOT NULL,
    permalink text
);


--
-- Name: schema_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.schema_migrations (
    version character varying(128) NOT NULL
);


--
-- Name: seeders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.seeders (
    name character varying(255) NOT NULL
);


--
-- Name: token; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.token (
    id text NOT NULL,
    token text NOT NULL,
    expires timestamp with time zone
);


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id text NOT NULL,
    username text,
    pass_hash text,
    paseto_secret text,
    reset_token text,
    role text,
    session text,
    last_request timestamp with time zone
);


--
-- Name: user_product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.user_product (
    user_id text NOT NULL,
    product_id text NOT NULL
);


--
-- Name: acclaim id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.acclaim ALTER COLUMN id SET DEFAULT nextval('public.acclaim_id_seq'::regclass);


--
-- Name: bio id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.bio ALTER COLUMN id SET DEFAULT nextval('public.bio_id_seq'::regclass);


--
-- Name: acclaim acclaim_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.acclaim
    ADD CONSTRAINT acclaim_pkey PRIMARY KEY (id);


--
-- Name: calendar_collaborator calendar_collaborator_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_collaborator
    ADD CONSTRAINT calendar_collaborator_id_key UNIQUE (id);


--
-- Name: calendar_collaborator calendar_collaborator_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_collaborator
    ADD CONSTRAINT calendar_collaborator_pkey PRIMARY KEY (calendar_id, collaborator_id);


--
-- Name: calendar_piece calendar_piece_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_piece
    ADD CONSTRAINT calendar_piece_id_key UNIQUE (id);


--
-- Name: calendar_piece calendar_piece_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_piece
    ADD CONSTRAINT calendar_piece_pkey PRIMARY KEY (calendar_id, piece_id);


--
-- Name: calendar calendar_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar
    ADD CONSTRAINT calendar_pkey PRIMARY KEY (id);


--
-- Name: collaborator collaborator_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.collaborator
    ADD CONSTRAINT collaborator_pkey PRIMARY KEY (id);


--
-- Name: user customer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT customer_pkey PRIMARY KEY (id);


--
-- Name: disc_link disc_link_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disc_link
    ADD CONSTRAINT disc_link_pkey PRIMARY KEY (id);


--
-- Name: disc disc_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disc
    ADD CONSTRAINT disc_pkey PRIMARY KEY (id);


--
-- Name: faq faq_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.faq
    ADD CONSTRAINT faq_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (name);


--
-- Name: music_file music_file_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.music_file
    ADD CONSTRAINT music_file_pkey PRIMARY KEY (id);


--
-- Name: music music_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.music
    ADD CONSTRAINT music_pkey PRIMARY KEY (id);


--
-- Name: photo photo_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.photo
    ADD CONSTRAINT photo_pkey PRIMARY KEY (id);


--
-- Name: piece piece_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.piece
    ADD CONSTRAINT piece_pkey PRIMARY KEY (id);


--
-- Name: product product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: seeders seeders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.seeders
    ADD CONSTRAINT seeders_pkey PRIMARY KEY (name);


--
-- Name: token token_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.token
    ADD CONSTRAINT token_pkey PRIMARY KEY (id);


--
-- Name: user_product user_product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_product
    ADD CONSTRAINT user_product_pkey PRIMARY KEY (user_id, product_id);


--
-- Name: calendar_collaborator_calendar_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calendar_collaborator_calendar_idx ON public.calendar_collaborator USING btree (calendar_id);


--
-- Name: calendar_collaborator_collaborator_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calendar_collaborator_collaborator_idx ON public.calendar_collaborator USING btree (collaborator_id);


--
-- Name: calendar_piece_calendar_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calendar_piece_calendar_idx ON public.calendar_piece USING btree (calendar_id);


--
-- Name: calendar_piece_piece_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calendar_piece_piece_idx ON public.calendar_piece USING btree (piece_id);


--
-- Name: calendar_time; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calendar_time ON public.calendar USING btree (date_time);


--
-- Name: calendar_trgm_gist_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX calendar_trgm_gist_idx ON public.calendar_trgm_matview USING gist (doc public.gist_trgm_ops);


--
-- Name: calendar_trgm_matview_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX calendar_trgm_matview_id_idx ON public.calendar_trgm_matview USING btree (id);


--
-- Name: collaborator_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX collaborator_trgm ON public.collaborator USING gist (public.immutable_concat_ws(' '::text, VARIADIC ARRAY[name, instrument]) public.gist_trgm_ops);


--
-- Name: disc_link_disc_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX disc_link_disc_idx ON public.disc_link USING btree (disc_id);


--
-- Name: music_file_music_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX music_file_music_idx ON public.music_file USING btree (music_id);


--
-- Name: piece_trgm; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX piece_trgm ON public.piece USING gist (public.immutable_concat_ws(' '::text, VARIADIC ARRAY[composer, piece]) public.gist_trgm_ops);


--
-- Name: user_product_product_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_product_product_idx ON public.user_product USING btree (product_id);


--
-- Name: user_product_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_product_user_idx ON public.user_product USING btree (user_id);


--
-- Name: user_username_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX user_username_idx ON public."user" USING btree (username);


--
-- Name: calendar cal_refresh; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER cal_refresh AFTER INSERT OR DELETE OR UPDATE ON public.calendar FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_search_matview();


--
-- Name: calendar_collaborator calcollab_refresh; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER calcollab_refresh AFTER INSERT OR DELETE ON public.calendar_collaborator FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_search_matview();


--
-- Name: calendar_piece calpiece_refresh; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER calpiece_refresh AFTER INSERT OR DELETE ON public.calendar_piece FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_search_matview();


--
-- Name: collaborator collab_refresh; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER collab_refresh AFTER UPDATE ON public.collaborator FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_search_matview();


--
-- Name: music_file music_file_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER music_file_trigger BEFORE INSERT OR UPDATE ON public.music_file FOR EACH ROW EXECUTE FUNCTION public.music_file_update_hash();


--
-- Name: music music_trigger; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER music_trigger AFTER INSERT OR UPDATE ON public.music FOR EACH ROW EXECUTE FUNCTION public.music_update_propagate_hash();


--
-- Name: piece piece_refresh; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER piece_refresh AFTER UPDATE ON public.piece FOR EACH STATEMENT EXECUTE FUNCTION public.refresh_search_matview();


--
-- Name: calendar_collaborator calendar_collaborator_calendar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_collaborator
    ADD CONSTRAINT calendar_collaborator_calendar_id_fkey FOREIGN KEY (calendar_id) REFERENCES public.calendar(id) ON DELETE CASCADE;


--
-- Name: calendar_collaborator calendar_collaborator_collaborator_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_collaborator
    ADD CONSTRAINT calendar_collaborator_collaborator_id_fkey FOREIGN KEY (collaborator_id) REFERENCES public.collaborator(id) ON DELETE CASCADE;


--
-- Name: calendar_piece calendar_piece_calendar_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_piece
    ADD CONSTRAINT calendar_piece_calendar_id_fkey FOREIGN KEY (calendar_id) REFERENCES public.calendar(id) ON DELETE CASCADE;


--
-- Name: calendar_piece calendar_piece_piece_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.calendar_piece
    ADD CONSTRAINT calendar_piece_piece_id_fkey FOREIGN KEY (piece_id) REFERENCES public.piece(id) ON DELETE CASCADE;


--
-- Name: disc_link disc_link_disc_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.disc_link
    ADD CONSTRAINT disc_link_disc_id_fkey FOREIGN KEY (disc_id) REFERENCES public.disc(id) ON DELETE CASCADE;


--
-- Name: music_file music_file_music_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.music_file
    ADD CONSTRAINT music_file_music_id_fkey FOREIGN KEY (music_id) REFERENCES public.music(id) ON DELETE CASCADE;


--
-- Name: user_product user_product_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_product
    ADD CONSTRAINT user_product_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.product(id) ON DELETE CASCADE;


--
-- Name: user_product user_product_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.user_product
    ADD CONSTRAINT user_product_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


--
-- Dbmate schema migrations
--

INSERT INTO public.schema_migrations (version) VALUES
    ('20230705033408'),
    ('20230705055529'),
    ('20230707020252'),
    ('20230707021812');
