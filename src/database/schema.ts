import { text, timestamp, varchar, uuid, pgTable } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  keycloakId: varchar('keycloak_id', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 255 }).notNull().unique(),
  bio: text('bio'),
  avatar: text('avatar'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  authorId: uuid('author_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
