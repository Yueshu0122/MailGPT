import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

// 优化数据库连接配置
export const client = postgres(connectionString!, { 
  prepare: true, // 启用查询准备，提高性能
  max: 10, // 连接池大小
  idle_timeout: 20, // 空闲连接超时
  connect_timeout: 10, // 连接超时
  connection: {
    application_name: 'mail-ai', // 应用名称，便于监控
  },
});

// 创建带日志的 drizzle 实例
export const db = drizzle(client, {
  logger: process.env.NODE_ENV === 'development'
}); 