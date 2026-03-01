import { getLessons } from "./app/lessonManifest";
import { db } from "./db/db";
import { lessons } from "./db/schema";
export async function loadNewLessons() {
    const lessonsArray = await getLessons();
    const lessonsToInsert: { name: string }[] = lessonsArray.map((lesson) => ({
        name: lesson.slug,
    }));

    if (lessonsToInsert.length === 0) {
        console.log("inserted 0 lessons");
        return;
    }

    const insertedLessons = await db.insert(lessons)
        .values(lessonsToInsert)
        .onConflictDoNothing({ target: lessons.name })
        .returning({ name: lessons.name });

    console.log(`inserted ${insertedLessons.length} lessons`);
}
