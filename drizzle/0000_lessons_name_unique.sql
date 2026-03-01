-- Deduplicate lessons by slug before enforcing uniqueness on lessons.name.
WITH canonical AS (
    SELECT "name", MIN("id") AS keep_id
    FROM "lessons"
    GROUP BY "name"
),
dupes AS (
    SELECT l."id" AS old_id, c.keep_id AS new_id
    FROM "lessons" l
    JOIN canonical c ON c."name" = l."name"
    WHERE l."id" <> c.keep_id
)
INSERT INTO "results" ("lessonId", "userId", "score")
SELECT d.new_id, r."userId", r."score"
FROM "results" r
JOIN dupes d ON d.old_id = r."lessonId"
ON CONFLICT ("lessonId", "userId")
DO UPDATE SET "score" = LEAST("results"."score", EXCLUDED."score");

WITH canonical AS (
    SELECT "name", MIN("id") AS keep_id
    FROM "lessons"
    GROUP BY "name"
),
dupes AS (
    SELECT l."id" AS old_id
    FROM "lessons" l
    JOIN canonical c ON c."name" = l."name"
    WHERE l."id" <> c.keep_id
)
DELETE FROM "results" r
USING dupes d
WHERE r."lessonId" = d.old_id;

WITH canonical AS (
    SELECT "name", MIN("id") AS keep_id
    FROM "lessons"
    GROUP BY "name"
),
dupes AS (
    SELECT l."id" AS old_id
    FROM "lessons" l
    JOIN canonical c ON c."name" = l."name"
    WHERE l."id" <> c.keep_id
)
DELETE FROM "lessons" l
USING dupes d
WHERE l."id" = d.old_id;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'lessons_name_unique'
          AND conrelid = 'lessons'::regclass
    ) THEN
        ALTER TABLE "lessons"
        ADD CONSTRAINT "lessons_name_unique" UNIQUE("name");
    END IF;
END $$;
