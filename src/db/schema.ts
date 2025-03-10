import { integer, pgTable, varchar, primaryKey } from "drizzle-orm/pg-core";
export const lessons = pgTable("lessons", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
});

export const results = pgTable("results", {
    lessonId: integer().references(() => lessons.id),
    userId: varchar({ length: 255 }),
    score: integer().notNull()
}, (table) => [
    primaryKey({ columns: [table.lessonId, table.userId] }),
]);
