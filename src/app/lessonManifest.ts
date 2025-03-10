type Lesson = { startPosition: number, startCode: string, endCode: string, name: string }

interface LessonManifest {
    [key: number]: { data: () => Promise<{ default: Lesson }>, name: string };
}
// Define lessons in order
const lessons = ['movementAndDeleting'];

// Generate manifest dynamically
export const lessonManifest: LessonManifest = Object.fromEntries(
    lessons.map((name, index) => [
        index,
        { data: () => import(`./lessons/${name}.json`), name },
    ])
);

export async function loadLesson(lessonNumber: number): Promise<Lesson | null> {
    if (lessonNumber in lessonManifest) {
        return (await lessonManifest[lessonNumber].data()).default;
    }
    return null;
}