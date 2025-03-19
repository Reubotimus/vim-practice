export type Lesson = {
    lessonName: string;
    slug: string;
    techniqueExplanation: string;
    codeInstructions: string;
    initialCode: string;
    finalCode: string;
};

type LessonMap = Map<string, Lesson>;

async function getLessonMap(): Promise<LessonMap> {
    const { lessons }: { lessons: Lesson[] } = await import('./lessons/lessons.json');
    return new Map(lessons.map((lesson) => [lesson.slug, lesson]));
}

async function getLessons(): Promise<Lesson[]> {
    const { lessons }: { lessons: Lesson[] } = await import('./lessons/lessons.json');
    return lessons;
}

// Function to load a lesson by slug
async function loadLesson(slug: string): Promise<Lesson | undefined> {
    return (await getLessonMap()).get(slug);
}

async function getNextLesson(slug: string): Promise<string> {
    const lessons = await getLessons();
    for (let i = 0; i < lessons.length - 1; i++) {
        if (lessons[i].slug === slug) {
            return lessons[i + 1].slug;
        }
    }
    return '/';
}

export { getLessonMap, loadLesson, getLessons, getNextLesson }