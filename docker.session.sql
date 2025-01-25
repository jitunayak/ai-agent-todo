SELECT
    *
FROM
    todo
WHERE
    id = 12;

-- Support for emojis
ALTER TABLE todo
ALTER COLUMN title TYPE VARCHAR(255) COLLATE "pg_catalog"."ucs_basic";