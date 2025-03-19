import { auth } from "@clerk/nextjs/server";
import { getLessons, Lesson } from "./lessonManifest";
import { getUserScores } from "./user";

export default async function Home() {
  const { userId } = await auth();
  const lessons = await getLessons();
  const scoreMap = new Map<string, number>();

  if (userId) {
    const scores = await getUserScores(userId);
    scores.forEach(s => {
      scoreMap.set(s.lessonName, s.score);
    })
  }

  return (
    <div className="min-h-screen w-full bg-[#282A36] py-10 px-4 flex flex-col items-center">
      <h2 className="text-[#F8F8F2] text-3xl font-bold text-center mb-8">
        Learn vim tricks and shortcuts using real world scenarios!
      </h2>
      <div className="flex flex-col w-full max-w-md space-y-2 text-[#F8F8F2]">
        {lessons.map((lesson: Lesson) => (
          <div
            key={lesson.lessonName}
            className="flex justify-between items-center p-4 rounded hover:bg-[#44475A]"
          >
            <a
              href={`/${lesson.slug}`}
              className="cursor-pointer transition-colors duration-300"
            >
              {lesson.lessonName}
            </a>
            <div className="text-[#6272A4]">
              {scoreMap.has(lesson.slug) ? scoreMap.get(lesson.slug) : 'incomplete'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}