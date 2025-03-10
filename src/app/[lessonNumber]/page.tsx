import fs from "fs";
import path from "path";
import VimText from "../components/vim-text";
import { auth } from "@clerk/nextjs/server";
import { loadLesson } from "../lessonManifest";
import { db } from "@/db/db";
import { lessons } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function Page({ params }: { params: Promise<{ lessonNumber: number }> }) {
    const { userId, redirectToSignIn } = await auth()

    if (!userId) return redirectToSignIn()

    const { lessonNumber } = await params;
    const lessonData = await loadLesson(lessonNumber);

    if (!lessonData) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-[#282A36]">
                Unable to find lesson
            </div>
        );
    }
    const lessonQueryRes = await db.select().from(lessons).where(eq(lessons.name, lessonData.name));
    const lessonId = lessonQueryRes[0].id;
    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-[#282A36]">
            <VimText start={lessonData.startCode} end={lessonData.endCode} startPosition={lessonData.startPosition} lessonId={lessonId} />
        </div>
    );
}
