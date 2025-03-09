import fs from "fs";
import path from "path";
import VimText from "../components/vim-text";

const getLessonData = async (lessonName: string) => {
    const lessonsDir = path.resolve(process.cwd(), "src/app/lessons");
    const filePath = path.join(lessonsDir, `${lessonName}.json`);
    if (fs.existsSync(filePath)) {
        const fileContent = await fs.promises.readFile(filePath, "utf-8");
        return JSON.parse(fileContent);
    }
    return null;
};

export default async function Page({ params }: { params: { lessonId: string } }) {
    const { lessonId } = await params;
    const lessonData = await getLessonData(lessonId);

    if (!lessonData) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center bg-[#282A36]">
                "Unable to find lesson"
            </div>
        );
    }

    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-[#282A36]">
            <VimText start={lessonData.startCode} end={lessonData.endCode} startPosition={lessonData.startPosition} />
        </div>
    );
}
