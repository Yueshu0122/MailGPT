import React, { useState } from "react";
import TodoCard from "./TodoCard";
import TodoEditModal from "./TodoEditModal";
import TodoMailModal from "./TodoMailModal";
import { Plus } from "lucide-react";

// 模拟 ToDos 数据，字段根据你的 schema
const mockTodos = [
  {
    id: 1,
    content: "完成 IMAP 附件下载功能",
    status: "pending",
    due_at: "2024-07-01T12:00:00Z",
    email_address: "user1@example.com",
    email_uid: 12345,
    created_at: "2024-06-01T10:00:00Z",
    updated_at: "2024-06-01T10:00:00Z",
  },
  {
    id: 2,
    content: "优化 ToDos 查询接口",
    status: "completed",
    due_at: "2024-07-02T18:00:00Z",
    email_address: "user2@example.com",
    email_uid: 12346,
    created_at: "2024-06-02T11:00:00Z",
    updated_at: "2024-06-02T11:00:00Z",
  },
  {
    id: 3,
    content: "邮件同步架构文档整理",
    status: "pending",
    due_at: "2024-07-03T09:00:00Z",
    email_address: "user3@example.com",
    email_uid: 12347,
    created_at: "2024-06-03T12:00:00Z",
    updated_at: "2024-06-03T12:00:00Z",
  },
  {
    id: 4,
    content: "用户认证系统集成测试",
    status: "overdue",
    due_at: "2024-06-25T15:30:00Z",
    email_address: "dev@company.com",
    email_uid: 12348,
    created_at: "2024-06-20T08:00:00Z",
    updated_at: "2024-06-25T16:00:00Z",
  },
  {
    id: 5,
    content: "前端响应式布局优化",
    status: "completed",
    due_at: "2024-06-28T17:00:00Z",
    email_address: "frontend@team.com",
    email_uid: 12349,
    created_at: "2024-06-15T14:30:00Z",
    updated_at: "2024-06-28T18:30:00Z",
  },
  {
    id: 6,
    content: "数据库性能监控配置",
    status: "pending",
    due_at: "2024-07-05T10:00:00Z",
    email_address: "dba@company.com",
    email_uid: 12350,
    created_at: "2024-06-25T09:15:00Z",
    updated_at: "2024-06-25T09:15:00Z",
  },
  {
    id: 7,
    content: "API 接口文档更新",
    status: "pending",
    due_at: "2024-07-08T14:00:00Z",
    email_address: "docs@team.com",
    email_uid: 12351,
    created_at: "2024-06-26T11:45:00Z",
    updated_at: "2024-06-26T11:45:00Z",
  },
//   {
//     id: 8,
//     content: "安全漏洞扫描和修复",
//     status: "overdue",
//     due_at: "2024-06-20T16:00:00Z",
//     email_address: "security@company.com",
//     email_uid: 12352,
//     created_at: "2024-06-10T13:20:00Z",
//     updated_at: "2024-06-20T17:30:00Z",
//   },
//   {
//     id: 9,
//     content: "移动端适配测试",
//     status: "completed",
//     due_at: "2024-06-30T12:00:00Z",
//     email_address: "mobile@team.com",
//     email_uid: 12353,
//     created_at: "2024-06-18T16:45:00Z",
//     updated_at: "2024-06-30T13:15:00Z",
//   },
//   {
//     id: 10,
//     content: "部署流程自动化配置",
//     status: "pending",
//     due_at: "2024-07-10T09:00:00Z",
//     email_address: "devops@company.com",
//     email_uid: 12354,
//     created_at: "2024-06-27T10:30:00Z",
//     updated_at: "2024-06-27T10:30:00Z",
//   },
//   {
//     id: 11,
//     content: "邮件客户端性能优化",
//     status: "pending",
//     due_at: "2024-07-15T11:00:00Z",
//     email_address: "frontend@team.com",
//     email_uid: 12355,
//     created_at: "2024-06-28T10:00:00Z",
//     updated_at: "2024-06-28T10:00:00Z",
//   },
//   {
//     id: 12,
//     content: "数据库索引优化",
//     status: "pending",
//     due_at: "2024-07-20T14:00:00Z",
//     email_address: "dba@company.com",
//     email_uid: 12356,
//     created_at: "2024-06-29T09:00:00Z",
//     updated_at: "2024-06-29T09:00:00Z",
//   },
//   {
//     id: 13,
//     content: "API 接口性能监控",
//     status: "pending",
//     due_at: "2024-07-25T10:00:00Z",
//     email_address: "devops@company.com",
//     email_uid: 12357,
//     created_at: "2024-06-30T10:00:00Z",
//     updated_at: "2024-06-30T10:00:00Z",
//   },
//   {
//     id: 14,
//     content: "前端缓存策略优化",
//     status: "pending",
//     due_at: "2024-08-05T12:00:00Z",
//     email_address: "frontend@team.com",
//     email_uid: 12358,
//     created_at: "2024-07-01T10:00:00Z",
//     updated_at: "2024-07-01T10:00:00Z",
//   },
//   {
//     id: 15,
//     content: "数据库备份策略完善",
//     status: "pending",
//     due_at: "2024-08-10T15:00:00Z",
//     email_address: "dba@company.com",
//     email_uid: 12359,
//     created_at: "2024-07-02T11:00:00Z",
//     updated_at: "2024-07-02T11:00:00Z",
//   },
//   {
//     id: 16,
//     content: "安全审计日志完善",
//     status: "pending",
//     due_at: "2024-08-15T16:00:00Z",
//     email_address: "security@company.com",
//     email_uid: 12360,
//     created_at: "2024-07-03T12:00:00Z",
//     updated_at: "2024-07-03T12:00:00Z",
//   },
//   {
//     id: 17,
//     content: "移动端适配测试优化",
//     status: "pending",
//     due_at: "2024-08-20T17:00:00Z",
//     email_address: "mobile@team.com",
//     email_uid: 12361,
//     created_at: "2024-07-04T13:00:00Z",
//     updated_at: "2024-07-04T13:00:00Z",
//   },
//   {
//     id: 18,
//     content: "部署流程自动化配置完善",
//     status: "pending",
//     due_at: "2024-08-25T18:00:00Z",
//     email_address: "devops@company.com",
//     email_uid: 12362,
//     created_at: "2024-07-05T14:00:00Z",
//     updated_at: "2024-07-05T14:00:00Z",
//   },
//   {
//     id: 19,
//     content: "邮件客户端性能优化",
//     status: "pending",
//     due_at: "2024-09-05T19:00:00Z",
//     email_address: "frontend@team.com",
//     email_uid: 12363,
//     created_at: "2024-07-06T15:00:00Z",
//     updated_at: "2024-07-06T15:00:00Z",
//   },
//   {
//     id: 20,
//     content: "数据库索引优化",
//     status: "pending",
//     due_at: "2024-09-10T20:00:00Z",
//     email_address: "dba@company.com",
//     email_uid: 12364,
//     created_at: "2024-07-07T16:00:00Z",
//     updated_at: "2024-07-07T16:00:00Z",
//   },
];

export default function Todos() {
  const [todos, setTodos] = useState(mockTodos);
  const [draggedTodo, setDraggedTodo] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editTodo, setEditTodo] = useState<any | null>(null);
  const [showMailTodo, setShowMailTodo] = useState<any | null>(null);
  const [showAddTodo, setShowAddTodo] = useState(false);

  const handleDragStart = (e: React.DragEvent, todoId: number) => {
    setDraggedTodo(todoId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedTodo === null) return;

    const draggedIndex = todos.findIndex(todo => todo.id === draggedTodo);
    if (draggedIndex === -1) return;

    const newTodos = [...todos];
    const [draggedItem] = newTodos.splice(draggedIndex, 1);
    newTodos.splice(dropIndex, 0, draggedItem);

    setTodos(newTodos);
    setDraggedTodo(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedTodo(null);
    setDragOverIndex(null);
  };

  const handleEditSave = (updated: any) => {
    setTodos(todos => todos.map(t => t.id === updated.id ? updated : t));
    setEditTodo(null);
  };
  
  const handleAddSave = (newTodo: any) => {
    const todoWithId = {
      ...newTodo,
      id: Math.max(...todos.map(t => t.id), 0) + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      email_address: "new@example.com",
      email_uid: null,
    };
    setTodos(todos => [todoWithId, ...todos]);
    setShowAddTodo(false);
  };
  
  const handleDelete = (todo: any) => {
    setTodos(todos => todos.filter(t => t.id !== todo.id));
  };

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-lg border border-gray-200 p-6 shadow-sm overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">ToDos</h2>
        <button
          onClick={() => setShowAddTodo(true)}
          className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
          title="新增ToDo"
        >
          <Plus size={20} />
        </button>
      </div>
      <div className="flex flex-row flex-wrap gap-4 justify-start items-stretch overflow-y-auto pb-2">
        {todos.map((todo, index) => (
          <div
            key={todo.id}
            draggable
            onDragStart={(e) => handleDragStart(e, todo.id)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`transition-all duration-200 ${
              draggedTodo === todo.id ? "opacity-50" : ""
            } ${
              dragOverIndex === index && draggedTodo !== todo.id
                ? "border-2 border-dashed border-blue-400 bg-blue-50 rounded-lg"
                : ""
            }`}
          >
            <TodoCard
              todo={todo}
              onEdit={setEditTodo}
              onShowMail={setShowMailTodo}
              onDelete={handleDelete}
            />
          </div>
        ))}
      </div>
      {/* 编辑弹窗 */}
      <TodoEditModal
        open={!!editTodo}
        todo={editTodo}
        onClose={() => setEditTodo(null)}
        onSave={handleEditSave}
      />
      {/* 新增弹窗 */}
      <TodoEditModal
        open={showAddTodo}
        todo={null}
        onClose={() => setShowAddTodo(false)}
        onSave={handleAddSave}
      />
      {/* 邮件编辑弹窗 */}
      <TodoMailModal
        open={!!showMailTodo}
        todo={showMailTodo}
        onClose={() => setShowMailTodo(null)}
        onSave={handleEditSave}
      />
    </div>
  );
} 