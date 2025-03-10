import { lessonManifest } from "./app/lessonManifest";
import { db } from "./db/db";
import { lessons } from "./db/schema";
export async function loadNewLessons() {
    const currentLessons = await db.select().from(lessons)
    const existingLessonNames = new Set(currentLessons.map((l) => l.name));

    const lessonsToInsert: { name: string }[] = Object.values(lessonManifest)
        .map(lesson => lesson.name)
        .filter(name => !existingLessonNames.has(name))
        .map(name => ({ name }));

    if (lessonsToInsert.length > 0) {
        await db.insert(lessons).values(lessonsToInsert);
    }
}