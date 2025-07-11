import React, { useState, useEffect } from "react";
import TodoCard from "./TodoCard";
import TodoEditModal from "./TodoEditModal";
import TodoMailModal from "./TodoMailModal";
import { Plus } from "lucide-react";
import { CheckSquare } from "lucide-react";
import { Minus, Plus as PlusIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// mockTodos 仅作初始占位
const mockTodos: any[] = [];

interface TodosProps {
  selectedAccountId?: number | null;
}

export default function Todos({ selectedAccountId }: TodosProps) {
  const [todos, setTodos] = useState<any[]>(mockTodos);
  const [draggedTodo, setDraggedTodo] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [editTodo, setEditTodo] = useState<any | null>(null);
  const [showMailTodo, setShowMailTodo] = useState<any | null>(null);
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [fontSize, setFontSize] = useState<'xs' | 'sm' | 'base' | 'lg' | 'xl'>('sm');

  // 字体大小调整函数
  const decreaseFontSize = () => {
    const sizes: ('xs' | 'sm' | 'base' | 'lg' | 'xl')[] = ['xs', 'sm', 'base', 'lg', 'xl'];
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex > 0) {
      setFontSize(sizes[currentIndex - 1]);
    }
  };

  const increaseFontSize = () => {
    const sizes: ('xs' | 'sm' | 'base' | 'lg' | 'xl')[] = ['xs', 'sm', 'base', 'lg', 'xl'];
    const currentIndex = sizes.indexOf(fontSize);
    if (currentIndex < sizes.length - 1) {
      setFontSize(sizes[currentIndex + 1]);
    }
  };

  // 首次加载时从接口获取todos
  useEffect(() => {
    const fetchTodos = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        
        if (!accessToken) {
          console.error('No access token, please login again.');
          return;
        }

        const response = await fetch("/api/todos/get", { 
          method: "POST",
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ page: 1 }),
        });
        
        const data = await response.json();
        if (data.success) {
          setTodos(data.data);
        } else {
          console.error('Failed to fetch todos:', data.error);
        }
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    };

    fetchTodos();
  }, []);

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
      content: newTodo.content || "New Todo",
      status: newTodo.status || "pending",
      dueAt: newTodo.dueAt || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      emailAddress: newTodo.emailAddress || "new@example.com",
      emailUid: newTodo.emailUid || null,
    };
    setTodos(todos => [todoWithId, ...todos]);
    setShowAddTodo(false);
  };
  
  const handleDelete = async (todo: any) => {
    // 1. 乐观更新UI
    setTodos(todos => todos.filter(t => t.id !== todo.id));
    // 2. 异步请求后端删除
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      if (!accessToken) {
        console.error('No access token, please login again.');
        return;
      }
      await fetch("/api/todos/delete", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: todo.id }),
      });
    } catch (error) {
      console.error('删除ToDo失败:', error);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-white rounded-lg border border-gray-200 p-6 shadow-sm overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <CheckSquare className="w-6 h-6 text-blue-500" />
          To-Do
        </h2>
        <div className="flex items-center gap-2">
          {/* 字体大小调整按钮 */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={decreaseFontSize}
              disabled={fontSize === 'xs'}
              className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="减小字体"
            >
              <Minus size={16} />
            </button>
            <span className="px-2 text-xs text-gray-600 font-medium min-w-[2rem] text-center">
              {fontSize.toUpperCase()}
            </span>
            <button
              onClick={increaseFontSize}
              disabled={fontSize === 'xl'}
              className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="增大字体"
            >
              <PlusIcon size={16} />
            </button>
          </div>
          {/* 新增ToDo按钮 */}
          <button
            onClick={() => setShowAddTodo(true)}
            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-colors"
            title="新增ToDo"
          >
            <Plus size={20} />
          </button>
        </div>
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
              fontSize={fontSize}
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
        selectedAccountId={selectedAccountId}
      />
      {/* 新增弹窗 */}
      <TodoEditModal
        open={showAddTodo}
        todo={null}
        onClose={() => setShowAddTodo(false)}
        onSave={handleAddSave}
        selectedAccountId={selectedAccountId}
      />
      {/* 邮件编辑弹窗 */}
      <TodoMailModal
        open={!!showMailTodo}
        todo={showMailTodo}
        onClose={() => setShowMailTodo(null)}
        onSave={handleEditSave}
        selectedAccountId={selectedAccountId}
      />
    </div>
  );
} 