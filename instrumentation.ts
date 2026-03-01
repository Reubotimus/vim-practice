import { loadNewLessons } from "@/loadLessons";

export async function register() {
    if (process.env.SEED_LESSONS_ON_BOOT !== "true") {
        return;
    }

    try {
        await loadNewLessons();
    } catch (error) {
        console.error("Failed to seed lessons on boot", error);
    }
}
