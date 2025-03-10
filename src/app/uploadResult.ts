"use server"
import { db } from "@/db/db";
import { results } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";

export async function uploadResult({ lessonId, score }: { lessonId: number, score: number }) {
    const { userId } = await auth();
    if (!userId) return;

    await db.insert(results)
        .values({ lessonId, score, userId })
        .onConflictDoUpdate({
            target: [results.lessonId, results.userId],
            set: { score: sql`LEAST(${results.score}, ${score})` } // Update only if the new score is lower
        });
}
