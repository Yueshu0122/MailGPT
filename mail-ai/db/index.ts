import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;
// Disable prefetch as it is not supported for "Transaction" pool mode
export const client = postgres(connectionString!, { prepare: false });

// 创建带日志的 drizzle 实例
export const db = drizzle(client, {
  logger: process.env.NODE_ENV === 'development'
}); 