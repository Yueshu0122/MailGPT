import React from "react";
import { Edit2, Mail, X } from "lucide-react";

interface Todo {
  id: number;
  content: string;
  status: string;
  due_at: string;
  email_address: string;
  email_uid: number;
  created_at: string;
  updated_at: string;
}

interface TodoCardProps {
  todo: Todo;
  onEdit?: (todo: Todo) => void;
  onShowMail?: (todo: Todo) => void;
  onDelete?: (todo: Todo) => void;
  fontSize?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
}

const statusColor: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
};

export default function TodoCard({ todo, onEdit, onShowMail, onDelete, fontSize = 'base' }: TodoCardProps) {
  // 字体大小映射
  const fontSizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  return (
    <div className="relative flex flex-col bg-gray-50 rounded-lg shadow border border-gray-100 p-4 hover:shadow-md transition-shadow w-48 min-w-[180px] max-w-[200px] h-70">
      {/* 左上角图标 */}
      <div className="absolute top-2 left-2 flex space-x-1 z-10">
        <button
          className="p-0.5 text-gray-400 hover:text-blue-500"
          style={{ fontSize: 14 }}
          onClick={e => { e.stopPropagation(); onEdit && onEdit(todo); }}
          title="编辑"
        >
          <Edit2 size={14} />
        </button>
        {todo.email_uid ? (
          <button
            className="p-0.5 text-gray-400 hover:text-green-500"
            style={{ fontSize: 14 }}
            onClick={e => { e.stopPropagation(); onShowMail && onShowMail(todo); }}
            title="查看邮件"
          >
            <Mail size={14} />
          </button>
        ) : null}
      </div>
      {/* 右上角删除图标 */}
      <button
        className="absolute top-2 right-2 p-0.5 text-gray-400 hover:text-red-500 z-10"
        style={{ fontSize: 14 }}
        onClick={e => { e.stopPropagation(); onDelete && onDelete(todo); }}
        title="删除"
      >
        <X size={14} />
      </button>
      <div className="flex-1 mt-2">
        <span className={`${fontSizeClasses[fontSize]} text-gray-900 break-words leading-relaxed`}>{todo.content}</span>
      </div>
      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-gray-200">
        <span className="text-xs text-gray-500">due:{todo.due_at ? new Date(todo.due_at).toLocaleDateString() : "-"}</span>
        <span className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${statusColor[todo.status] || "bg-gray-100 text-gray-800"}`}>
          {todo.status}
        </span>
      </div>
    </div>
  );
} 