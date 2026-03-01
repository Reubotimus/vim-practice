"use server"
import { db } from "@/db/db";
import { lessons, results } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";

export async function uploadResult({ lessonName, score }: { lessonName: string, score: number }) {
    const { userId } = await auth();
    if (!userId) return;

    if (!Number.isInteger(score) || score < 0) {
        console.warn(`uploadResult: invalid score "${score}" for lesson "${lessonName}"`);
        return;
    }

    const [lesson] = await db
        .select({ id: lessons.id })
        .from(lessons)
        .where(eq(lessons.name, lessonName))
        .limit(1);

    if (!lesson) {
        console.warn(`uploadResult: unknown lesson "${lessonName}"`);
        return;
    }

    await db.insert(results)
        .values({ lessonId: lesson.id, score, userId })
        .onConflictDoUpdate({
            target: [results.lessonId, results.userId],
            set: { score: sql`LEAST(${results.score}, ${score})` } // Update only if the new score is lower
        });
}
