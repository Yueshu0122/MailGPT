import { sql } from "drizzle-orm";
import { pgTable, serial, varchar, uuid, smallint, timestamp } from "drizzle-orm/pg-core";

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