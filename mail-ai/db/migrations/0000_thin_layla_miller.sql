CREATE TABLE "EmailAccounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid DEFAULT (auth.uid()) NOT NULL,
	"email_address" varchar(255),
	"encrypted_password" varchar(255),
	"imap_server_address" varchar(255),
	"imap_server_port" smallint,
	"imap_encryption" varchar(255),
	"smtp_server_address" varchar(255),
	"smtp_server_port" smallint,
	"smtp_encryption" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ToDos" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid DEFAULT (auth.uid()) NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"status" varchar(50) DEFAULT 'pending',
	"priority" varchar(50) DEFAULT 'medium',
	"email_address" varchar(255),
	"email_uid" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
