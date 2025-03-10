import { loadNewLessons } from "@/loadLessons";

export async function register() {
    await loadNewLessons();
}