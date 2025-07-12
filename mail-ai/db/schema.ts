import { sql } from "drizzle-orm";
import { pgTable, serial, varchar, uuid, smallint, timestamp, text, integer } from "drizzle-orm/pg-core";

export const emailAccounts = pgTable("EmailAccounts", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").default(sql`(auth.uid())`).notNull(),
  emailAddress: varchar("email_address", { length: 255 }),
  encryptedPassword: varchar("encrypted_password", { length: 255 }),
  imapServerAddress: varchar("imap_server_address", { length: 255 }),
  imapServerPort: smallint("imap_server_port"),
  imapEncryption: varchar("imap_encryption", { length: 255 }),
  smtpServerAddress: varchar("smtp_server_address", { length: 255 }),
  smtpServerPort: smallint("smtp_server_port"),
  smtpEncryption: varchar("smtp_encryption", { length: 255 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const todos = pgTable("ToDos", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").default(sql`(auth.uid())`).notNull(),
  content: varchar("content", { length: 500 }).notNull(),
  status: varchar("status", { length: 50 }).default("pending"),
  dueAt: timestamp("due_at", { withTimezone: true }),
  emailAddress: varchar("email_address", { length: 255 }),
  emailUid: integer("email_uid"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// 创建索引以提高查询性能
export const todosIndexes = {
  userIdIdx: sql`CREATE INDEX IF NOT EXISTS "todos_user_id_idx" ON "ToDos" ("user_id")`,
  createdAtIdx: sql`CREATE INDEX IF NOT EXISTS "todos_created_at_idx" ON "ToDos" ("created_at" DESC)`,
  userIdCreatedAtIdx: sql`CREATE INDEX IF NOT EXISTS "todos_user_id_created_at_idx" ON "ToDos" ("user_id", "created_at" DESC)`,
}; 