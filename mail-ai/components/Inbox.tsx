'use client';

import React, { useState, useEffect } from 'react';
import { Search, Star, Clock, User, Mail, Loader2, CheckSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import * as Tooltip from '@radix-ui/react-tooltip';

interface Email {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  text: string;
  html?: string;
  attachments: Array<{
    filename: string;
    contentType: string;
    size: number;
  }>;
  flags: string[];
  uid: number;
}

interface InboxProps {
  onEmailSelect: (email: Email) => void;
  selectedEmail: Email | null;
  selectedAccountId?: number;
  onAddTodo?: (email: Email) => void;
}

const Inbox: React.FC<InboxProps> = ({ onEmailSelect, selectedEmail, selectedAccountId, onAddTodo }) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [emails, setEmails] = useState<Email[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processingEmailId, setProcessingEmailId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // 获取邮件数据
  const fetchEmails = async (accountId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        setError('No access token, please login again.');
        return;
      }

      const response = await fetch(`/api/mails/get?accountId=${accountId}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setEmails(result.emails || []);
      } else {
        setError(result.error || 'Failed to fetch emails');
      }
    } catch (err) {
      setError('Failed to fetch emails');
      console.error('Error fetching emails:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 当selectedAccountId变化时获取邮件
  useEffect(() => {
    if (selectedAccountId) {
      fetchEmails(selectedAccountId);
    }
  }, [selectedAccountId]);

  // 刷新邮件
  const handleRefresh = () => {
    if (selectedAccountId) {
      fetchEmails(selectedAccountId);
    }
  };

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  // 检查邮件是否已读
  const isEmailRead = (email: Email) => {
    return email.flags.includes('\\Seen');
  };

  // 检查邮件是否有附件
  const hasAttachments = (email: Email) => {
    return email.attachments && email.attachments.length > 0;
  };

  const filteredEmails = emails.filter(email => {
    const matchesFilter = filter === 'all' || (filter === 'unread' && !isEmailRead(email));
    const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (!selectedAccountId) {
    return (
      <div className="flex-1 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Please select an email account</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white rounded-lg border border-gray-200 flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Inbox</h1>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 flex items-center"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : null}
              Refresh
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All mail
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                filter === 'unread' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Unread
            </button>
          </div>
        </div>
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search emails..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Email List - 滚动区域 */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-blue-500" />
              <p className="text-gray-500">Loading emails...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Mail className="w-12 h-12 mx-auto mb-4 text-red-300" />
              <p className="text-red-500">{error}</p>
              <button
                onClick={handleRefresh}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No emails found</p>
            </div>
          </div>
        ) : (
          filteredEmails.map((email) => (
            <div
              key={email.id}
              onClick={() => onEmailSelect(email)}
              className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
                selectedEmail?.id === email.id ? 'bg-blue-50 border-blue-200' : ''
              } ${!isEmailRead(email) ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium text-sm ${!isEmailRead(email) ? 'text-gray-900' : 'text-gray-700'}`}>
                        {email.from}
                      </span>
                      {!isEmailRead(email) && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">{formatTime(email.date)}</span>
                      {email.flags.includes('\\Flagged') && (
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      )}
                      {/* ToDo按钮 */}
                      {typeof onAddTodo === 'function' && (
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <button
                              className={`p-1 rounded-full transition-colors ${
                                processingEmailId === email.id 
                                  ? 'text-blue-500 bg-blue-100' 
                                  : 'text-gray-400 hover:text-blue-500 hover:bg-blue-100'
                              }`}
                              disabled={processingEmailId === email.id}
                              onClick={async (e) => { 
                                e.stopPropagation(); 
                                setProcessingEmailId(email.id);
                                setToastMessage(null);
                                try {
                                  const supabase = createClient();
                                  const { data: { session } } = await supabase.auth.getSession();
                                  const accessToken = session?.access_token;
                                  
                                  if (!accessToken) {
                                    console.error('No access token, please login again.');
                                    setToastMessage({ type: 'error', message: 'Authentication failed' });
                                    return;
                                  }
                                  
                                  const response = await fetch('/api/todos/ai/summarize', {
                                    method: 'POST',
                                    headers: {
                                      'Authorization': `Bearer ${accessToken}`,
                                      'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify({ email }),
                                  });
                                  
                                  const result = await response.json();
                                  
                                  if (result.success) {
                                    if (result.data.task) {
                                      console.log('AI识别并创建了待办事项:', result.data.task);
                                      setToastMessage({ type: 'success', message: result.data.message });
                                    } else {
                                      console.log('AI分析结果:', result.data.message);
                                      setToastMessage({ type: 'error', message: result.data.message });
                                    }
                                  } else {
                                    console.error('AI分析失败:', result.error);
                                    setToastMessage({ type: 'error', message: `AI analysis failed: ${result.error}` });
                                  }
                                } catch (error) {
                                  console.error('调用AI接口失败:', error);
                                  setToastMessage({ type: 'error', message: 'Failed to call AI service' });
                                } finally {
                                  setProcessingEmailId(null);
                                  // 3秒后自动清除提示
                                  setTimeout(() => setToastMessage(null), 3000);
                                }
                              }}
                            >
                              {processingEmailId === email.id ? (
                                <Loader2 size={16} className="animate-spin" />
                              ) : (
                                <CheckSquare size={16} />
                              )}
                            </button>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content
                              className="bg-black text-white px-3 py-1 rounded text-base shadow-lg z-50"
                              side="top"
                              align="center"
                              sideOffset={4}
                            >
                              {processingEmailId === email.id ? 'Processing...' : 'AI analyze and create ToDo'}
                              <Tooltip.Arrow className="fill-black" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      )}
                    </div>
                  </div>
                  
                  <h3 className={`text-sm font-medium mt-1 ${!isEmailRead(email) ? 'text-gray-900' : 'text-gray-700'}`}>
                    {email.subject}
                  </h3>
                  
                  <p className="text-sm text-gray-600 mt-1 truncate">
                    {email.text.substring(0, 100)}...
                  </p>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    {hasAttachments(email) && (
                      <div className="flex items-center space-x-1">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {email.attachments.length} attachment{email.attachments.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Toast提示 */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg transition-all duration-300 ${
          toastMessage.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {toastMessage.message}
        </div>
      )}
    </div>
  );
};

export default Inbox; 