import React, { useState, useEffect } from "react";
import { Circle, CheckCircle, AlertCircle, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface TodoEditModalProps {
  open: boolean;
  todo: any;
  onClose: () => void;
  onSave: (updated: any) => void;
  selectedAccountId?: number | null;
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

export default function TodoEditModal({ open, todo, onClose, onSave, selectedAccountId }: TodoEditModalProps) {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("pending");
  const [dueAt, setDueAt] = useState(getTodayStr());

  useEffect(() => {
    if (todo) {
      setContent(todo.content || "");
      setStatus(todo.status || "pending");
      // 正确处理日期格式
      if (todo.dueAt) {
        try {
          const date = new Date(todo.dueAt);
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            setDueAt(`${year}-${month}-${day}`);
          } else {
            setDueAt(getTodayStr());
          }
        } catch (error) {
          setDueAt(getTodayStr());
        }
      } else {
        setDueAt(getTodayStr());
      }
    } else {
      setContent("");
      setStatus("pending");
      setDueAt(getTodayStr());
    }
  }, [todo, open]);

  if (!open) return null;

  const handleClose = () => {
    // 1. 立即更新前端 - 转换为ISO格式
    const dueDate = dueAt ? new Date(dueAt + 'T00:00:00').toISOString() : null;
    onSave({ ...todo, content, status, dueAt: dueDate });
    onClose();

    // 2. 异步请求后端
    (async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        // 获取邮箱地址逻辑
        let emailAddress = "new@example.com";
        if (selectedAccountId) {
          try {
            const response = await fetch('/api/mail/accounts/get', {
              headers: { 'Authorization': `Bearer ${session.access_token}` },
            });
            const result = await response.json();
            if (result.success && result.accounts) {
              const selectedAccount = result.accounts.find((account: any) => account.id === selectedAccountId);
              if (selectedAccount) emailAddress = selectedAccount.emailAddress;
            }
          } catch {}
        }

        // 将日期字符串转换为ISO格式
        const dueDate = dueAt ? new Date(dueAt + 'T00:00:00').toISOString() : null;
        
        const todoData = {
          ...(todo?.id && { id: todo.id }),
          content,
          status,
          due_at: dueDate,
          email_address: todo?.emailAddress || emailAddress,
          email_uid: todo?.emailUid || null,
        };

        await fetch("/api/todos/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(todoData),
        });
      } catch (error) {
        console.error("保存出错:", error);
      }
    })();
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
            placeholder="Enter your todo..."
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