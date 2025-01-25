import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const todoTable = pgTable("todo", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});
