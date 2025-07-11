import React, { useState, useEffect } from "react";
import { Circle, CheckCircle, AlertCircle, X } from "lucide-react";

interface TodoEditModalProps {
  open: boolean;
  todo: any;
  onClose: () => void;
  onSave: (updated: any) => void;
}

const statusIcons = {
  pending: Circle,
  completed: CheckCircle,
  overdue: AlertCircle,
};

const statusColors = {
  pending: "text-gray-400",
  completed: "text-green-500",
  overdue: "text-red-500",
};

function getTodayStr() {
  const d = new Date();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

export default function TodoEditModal({ open, todo, onClose, onSave }: TodoEditModalProps) {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("pending");
  const [dueAt, setDueAt] = useState(getTodayStr());

  useEffect(() => {
    if (todo) {
      setContent(todo.content || "");
      setStatus(todo.status || "pending");
      setDueAt(todo.due_at ? todo.due_at.slice(0, 10) : getTodayStr());
    } else {
      setContent("");
      setStatus("pending");
      setDueAt(getTodayStr());
    }
  }, [todo, open]);

  if (!open) return null;

  const handleClose = () => {
    onSave({ ...todo, content, status, due_at: dueAt });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-gray-50 rounded-lg shadow border border-gray-100 p-4 w-full max-w-xs relative flex flex-col h-120">
        {/* 右上角关闭按钮 */}
        <button
          className="absolute top-2 right-2 p-0.5 text-gray-400 hover:text-blue-500"
          style={{ fontSize: 18 }}
          onClick={handleClose}
          title="关闭"
        >
          <X size={18} />
        </button>
        {/* 内容编辑区域 */}
        <div className="mb-4 mt-2 flex-1">
          <textarea
            className="w-full p-2 text-sm bg-transparent focus:outline-none resize-none h-full min-h-[96px]"
            value={content}
            onChange={e => setContent(e.target.value)}
            rows={4}
            placeholder="输入ToDo内容..."
          />
        </div>
        {/* 底部 状态+日期 横向排列 */}
        <div className="flex items-center justify-between gap-4 mt-2">
          {/* 状态图标选择 */}
          <div className="flex space-x-4">
            {Object.entries(statusIcons).map(([statusKey, IconComponent]) => {
              const isSelected = status === statusKey;
              return (
                <button
                  key={statusKey}
                  className={`p-2 rounded-full transition-all ${
                    isSelected 
                      ? `${statusColors[statusKey as keyof typeof statusColors]} bg-white shadow-md border-2 border-blue-400` 
                      : "text-gray-300 hover:text-gray-400"
                  }`}
                  onClick={() => setStatus(statusKey)}
                  title={statusKey === "pending" ? "待办" : statusKey === "completed" ? "已完成" : "已逾期"}
                >
                  <IconComponent size={20} />
                </button>
              );
            })}
          </div>
          {/* 日期选择 */}
          <input
            type="date"
            className="p-2 text-sm bg-transparent focus:outline-none text-gray-700"
            value={dueAt}
            onChange={e => setDueAt(e.target.value)}
            style={{ minWidth: 0 }}
          />
        </div>
      </div>
    </div>
  );
} 