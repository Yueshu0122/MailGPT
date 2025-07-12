import React, { useState, useEffect } from "react";
import { Circle, CheckCircle, AlertCircle, X } from "lucide-react";
import EmailDetail from "./EmailDetail";
import { createClient } from "@/lib/supabase/client";

interface TodoMailModalProps {
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

export default function TodoMailModal({ open, todo, onClose, onSave, selectedAccountId }: TodoMailModalProps) {
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("pending");
  const [dueAt, setDueAt] = useState(getTodayStr());
  const [emailData, setEmailData] = useState<any>(null);
  const [isLoadingEmail, setIsLoadingEmail] = useState(false);

  useEffect(() => {
    if (todo) {
      setContent(todo.content || "");
      setStatus(todo.status || "pending");
      setDueAt(todo.dueAt ? todo.dueAt.slice(0, 10) : getTodayStr());
    } else {
      setContent("");
      setStatus("pending");
      setDueAt(getTodayStr());
    }
  }, [todo, open]);

  // 获取邮件详情
  useEffect(() => {
    if (open && todo?.emailUid && selectedAccountId) {
      const fetchEmailDetail = async () => {
        try {
          setIsLoadingEmail(true);
          const supabase = createClient();
          const { data: { session } } = await supabase.auth.getSession();
          const accessToken = session?.access_token;
          
          if (!accessToken) {
            console.error('No access token, please login again.');
            return;
          }

          const response = await fetch(`/api/mails/detail?accountId=${selectedAccountId}&uid=${todo.emailUid}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });
          
          const result = await response.json();
          
          if (result.success) {
            setEmailData(result.email);
          } else {
            console.error('Failed to fetch email detail:', result.error);
          }
        } catch (error) {
          console.error('Error fetching email detail:', error);
        } finally {
          setIsLoadingEmail(false);
        }
      };

      fetchEmailDetail();
    } else {
      setEmailData(null);
    }
      }, [open, todo?.emailUid, selectedAccountId]);

  if (!open) return null;

  const handleClose = () => {
    // 1. 立即更新前端
            onSave({ ...todo, content, status, dueAt: dueAt });
    onClose();

    // 2. 异步请求后端
    (async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const todoData = {
          ...(todo?.id && { id: todo.id }),
          content,
          status,
          due_at: dueAt,
          email_address: todo?.emailAddress || "new@example.com",
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
    <div className="fixed top-0 right-0 h-full w-7/10 z-50 flex items-center justify-end">
      <div className="relative w-full h-[90vh] my-auto rounded-xl shadow-2xl border border-gray-300 bg-gray-100 flex overflow-hidden">
        {/* 关闭按钮，左上角 */}
        <button
          className="absolute top-4 left-4 z-10 p-1 text-gray-500 hover:text-blue-500 bg-white rounded-full shadow"
          style={{ fontSize: 20 }}
          onClick={handleClose}
          title="关闭"
        >
          <X size={20} />
        </button>
        {/* 左侧编辑区域 4/10 */}
        <div className="flex-[4] min-w-[220px] max-w-[400px] bg-gray-200 border-r border-gray-300 flex flex-col relative">
          <div className="p-4 flex-1 flex flex-col">
            {/* 内容编辑区域 */}
            <div className="mb-4 mt-7 flex-1">
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
                          : "text-gray-400 hover:text-gray-500"
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
        {/* 右侧邮件详情区域 6/10 */}
        <div className="flex-[6] bg-white overflow-y-auto">
          <div className="p-6">
            {isLoadingEmail ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-gray-500">Loading email details...</p>
                </div>
              </div>
            ) : emailData ? (
              <EmailDetail 
                email={emailData}
                accountId={selectedAccountId || 1}
              />
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <p>No email data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 