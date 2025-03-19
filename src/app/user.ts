import { db } from "@/db/db";
import { lessons, results } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function getUserScores(userId: string) {
    const allResults = await db
        .select({
            lessonName: lessons.name,
            score: results.score,
        })
        .from(results)
        .innerJoin(lessons, eq(results.lessonId, lessons.id))
        .where(eq(results.userId, userId));

    return allResults;
}

export async function getScore(userId: string, lessonSlug: string): Promise<number | null> {
    const res = await db
        .select({ score: results.score })
        .from(results)
        .innerJoin(lessons, eq(results.lessonId, lessons.id))
        .where(and(
            eq(results.userId, userId),
            eq(lessons.name, lessonSlug)
        ))
    if (res.length == 0) {
        return null;
    }
    return res[0].score;
}