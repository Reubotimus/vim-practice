"use server"
import { db } from "@/db/db";
import { lessons, results } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, sql } from "drizzle-orm";

export async function uploadResult({ lessonName, score }: { lessonName: string, score: number }) {
    const { userId } = await auth();
    if (!userId) return;

    const [lesson] = await db
        .select()
        .from(lessons)
        .where(eq(lessons.name, lessonName));

    if (!lesson) { }
    await db.insert(results)
        .values({ lessonId: lesson.id, score, userId })
        .onConflictDoUpdate({
            target: [results.lessonId, results.userId],
            set: { score: sql`LEAST(${results.score}, ${score})` } // Update only if the new score is lower
        });
}
