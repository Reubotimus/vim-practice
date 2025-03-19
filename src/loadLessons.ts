import { getLessons } from "./app/lessonManifest";
import { db } from "./db/db";
import { lessons } from "./db/schema";
export async function loadNewLessons() {
    const lessonsArray = await getLessons();
    const currentLessons = await db.select().from(lessons);
    const existingLessonNames = new Set(currentLessons.map((l) => l.name));

    // Convert the iterator returned by lessonManifest.values() to an array
    const lessonsToInsert: { name: string }[] = lessonsArray
        .map(lesson => lesson.slug)
        .filter(name => !existingLessonNames.has(name))
        .map(name => ({ name }));

    if (lessonsToInsert.length > 0) {
        await db.insert(lessons).values(lessonsToInsert);
    }
    console.log(`inserted ${lessonsToInsert.length} lessons`);
}