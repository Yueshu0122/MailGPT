'use client';

import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  FileText, 
  Send, 
  Shield, 
  Trash2, 
  Archive, 
  CheckSquare, 
  Bot,
  ChevronDown,
  Mail,
  Plus,
  LogOut,
  Loader2,
  X
} from 'lucide-react';
import AddEmailAccountModal from './AddEmailAccountModal';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface EmailAccount {
  id: number;
  emailAddress: string;
  imapServerAddress: string;
  smtpServerAddress: string;
  createdAt: string;
}

interface SidebarProps {
  onNavigate: (route: string) => void;
  activeRoute: string;
  onAccountSelect?: (accountId: number) => void;
  selectedAccountId?: number | null;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, activeRoute, onAccountSelect, selectedAccountId }) => {
  const [selectedEmail, setSelectedEmail] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // 获取邮箱账户数据
  const fetchEmailAccounts = async () => {
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

      const response = await fetch('/api/mail/accounts/get', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setEmailAccounts(result.accounts || []);
        // 如果有账户，设置第一个为默认选中
        if (result.accounts && result.accounts.length > 0 && !selectedEmail) {
          setSelectedEmail(result.accounts[0].emailAddress);
          // 通知父组件选择第一个账户
          if (onAccountSelect) {
            onAccountSelect(result.accounts[0].id);
          }
        }
      } else {
        setError(result.error || 'Failed to fetch email accounts');
      }
    } catch (err) {
      setError('Failed to fetch email accounts');
      console.error('Error fetching email accounts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    fetchEmailAccounts();
  }, []);

  // 添加邮箱账户成功后刷新数据
  const handleAddEmailSuccess = () => {
    fetchEmailAccounts();
  };

  // 删除邮箱账户
  const handleDeleteEmail = async (account: EmailAccount) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        alert('No access token, please login again.');
        return;
      }

      const response = await fetch(`/api/mail/accounts/delete?id=${account.id}&email=${encodeURIComponent(account.emailAddress)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        // 刷新数据
        fetchEmailAccounts();
        // 如果删除的是当前选中的邮箱，清空选择
        if (selectedEmail === account.emailAddress) {
          setSelectedEmail('');
        }
      } else {
        alert(`Failed to delete account: ${result.error}`);
      }
    } catch (err) {
      alert('Failed to delete account');
      console.error('Error deleting email account:', err);
    }
  };

  const topMenuItems = [
    { id: 'todo', label: 'To-Do', icon: CheckSquare, count: 8 },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, count: 0 },
  ];

  const emailMenuItems = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: 12 },
    { id: 'drafts', label: 'Drafts', icon: FileText, count: 3 },
    { id: 'sent', label: 'Sent', icon: Send, count: 0 },
    { id: 'junk', label: 'Junk', icon: Shield, count: 5 },
    { id: 'trash', label: 'Trash', icon: Trash2, count: 0 },
    { id: 'archive', label: 'Archive', icon: Archive, count: 0 },
  ];

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 rounded-l-lg h-full flex flex-col">
      {/* Email Account Selector */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900 truncate">
                {selectedEmail}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {isLoading ? (
                <div className="flex items-center justify-center px-3 py-4 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading...
                </div>
              ) : error ? (
                <div className="px-3 py-2 text-sm text-red-500">
                  {error}
                </div>
              ) : emailAccounts.length === 0 ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-500">
                    No email accounts found
                  </div>
                  {/* 添加邮箱选项 */}
                  <button
                    onClick={() => {
                      setShowAddModal(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 border-t border-gray-100 last:rounded-b-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />Add Email
                  </button>
                </>
              ) : (
                <>
                  {emailAccounts.map((account) => (
                    <div
                      key={account.id}
                      className="flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg"
                    >
                      <button
                        onClick={() => {
                          setSelectedEmail(account.emailAddress);
                          setIsDropdownOpen(false);
                          // 通知父组件选择账户
                          if (onAccountSelect) {
                            onAccountSelect(account.id);
                          }
                        }}
                        className={`flex-1 text-left ${selectedAccountId === account.id ? 'text-blue-600 font-medium' : ''}`}
                      >
                        {account.emailAddress}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEmail(account);
                        }}
                        className="ml-2 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
                        title="Delete email account"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {/* 添加邮箱选项 */}
                  <button
                    onClick={() => {
                      setShowAddModal(true);
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 border-t border-gray-100 last:rounded-b-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" />Add Email
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {/* 顶部 To-Do 和 AI Assistant 分组 */}
        <div className="space-y-1">
          {topMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.count > 0 && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {/* 横线分隔 */}
        <div className="my-3 border-t border-gray-200" />
        {/* 邮箱相关菜单分组 */}
        <div className="space-y-1">
          {emailMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.count > 0 && (
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* 添加邮箱弹窗 */}
      {showAddModal && (
        <AddEmailAccountModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={handleAddEmailSuccess}
        />
      )}

      {/* Logout 按钮固定在底部 */}
      <div className="p-4 border-t border-gray-200 mt-auto">
        <button
          onClick={handleLogout}
          className={'w-full flex items-center justify-between p-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-50'}
        >
          <div className="flex items-center space-x-3">
            <LogOut className="w-5 h-5 text-gray-500" />
            <span className="font-medium">Logout</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 