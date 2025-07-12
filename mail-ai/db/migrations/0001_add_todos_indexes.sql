-- 为 ToDos 表添加性能索引
CREATE INDEX IF NOT EXISTS "todos_user_id_idx" ON "ToDos" ("user_id");
CREATE INDEX IF NOT EXISTS "todos_created_at_idx" ON "ToDos" ("created_at" DESC);
CREATE INDEX IF NOT EXISTS "todos_user_id_created_at_idx" ON "ToDos" ("user_id", "created_at" DESC); 