import VimText from "./vim-text";
import { auth } from "@clerk/nextjs/server";
import { getNextLesson, loadLesson } from "../lessonManifest";
import { getScore } from "../user";

export default async function Page({ params }: { params: Promise<{ lesson: string }> }) {
    const { userId, redirectToSignIn } = await auth()

    if (!userId) return redirectToSignIn()

    const { lesson } = await params;
    const lessonData = await loadLesson(lesson);

    const bestScore = await getScore(userId, lesson)

    if (!lessonData) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center">
                Unable to find lesson
            </div>
        );
    }
    const nextLesson = await getNextLesson(lessonData.slug);
    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-[#282A36]">
            <VimText lesson={lessonData} nextLesson={nextLesson} bestScore={bestScore} />
        </div>
    );
}
