'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Inbox from './Inbox';
import EmailDetail from './EmailDetail';
import Todos from './Todos';
import { createClient } from '@/lib/supabase/client';

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

interface EmailAccount {
  id: number;
  emailAddress: string;
  imapServerAddress: string;
  smtpServerAddress: string;
  createdAt: string;
}

const MailInbox: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<number | null>(null);
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);

  // 获取邮箱账户数据
  const fetchEmailAccounts = async () => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      if (!accessToken) {
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
        if (result.accounts && result.accounts.length > 0 && !selectedAccountId) {
          setSelectedAccountId(result.accounts[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching email accounts:', err);
    }
  };

  // 组件加载时获取数据
  useEffect(() => {
    fetchEmailAccounts();
  }, []);

  // 处理邮箱账户选择
  const handleAccountSelect = (accountId: number) => {
    setSelectedAccountId(accountId);
    setSelectedEmail(null);
    setIsDetailExpanded(false);
  };

  const handleNavigate = (route: string) => {
    setActiveRoute(route);
    setSelectedEmail(null);
    setIsDetailExpanded(false);
  };

  // 点击卡片时只显示详情，不展开
  const handleEmailSelect = (email: Email) => {
    setSelectedEmail(email);
    setIsDetailExpanded(false);
  };

  // 详情页展开/收起
  const handleDetailExpand = () => setIsDetailExpanded(true);
  const handleDetailBack = () => setIsDetailExpanded(false);

  // 处理添加ToDo
  const handleAddTodo = (email: Email) => {
    console.log('添加ToDo:', email);
    // TODO: 这里可以打开ToDo编辑弹窗，或者直接跳转到ToDo页面
    // 暂时先跳转到ToDo页面
    setActiveRoute('todo');
  };

  const renderMainContent = () => {
    switch (activeRoute) {
      case 'inbox':
        return (
          <Inbox 
            onEmailSelect={handleEmailSelect}
            selectedEmail={selectedEmail}
            selectedAccountId={selectedAccountId || undefined}
            onAddTodo={handleAddTodo}
          />
        );
      case 'drafts':
        return (
          <div className="flex-1 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <h2 className="text-xl font-semibold mb-2">Drafts</h2>
              <p>Draft emails will appear here</p>
            </div>
          </div>
        );
      case 'sent':
        return (
          <div className="flex-1 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <h2 className="text-xl font-semibold mb-2">Sent</h2>
              <p>Sent emails will appear here</p>
            </div>
          </div>
        );
      case 'junk':
        return (
          <div className="flex-1 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <h2 className="text-xl font-semibold mb-2">Junk</h2>
              <p>Junk emails will appear here</p>
            </div>
          </div>
        );
      case 'trash':
        return (
          <div className="flex-1 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <h2 className="text-xl font-semibold mb-2">Trash</h2>
              <p>Deleted emails will appear here</p>
            </div>
          </div>
        );
      case 'archive':
        return (
          <div className="flex-1 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <h2 className="text-xl font-semibold mb-2">Archive</h2>
              <p>Archived emails will appear here</p>
            </div>
          </div>
        );
      case 'todo':
        return (
          <Todos selectedAccountId={selectedAccountId} />
        );
      case 'ai-assistant':
        return (
          <div className="flex-1 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <h2 className="text-xl font-semibold mb-2">AI Assistant</h2>
              <p>AI-powered email assistance will appear here</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex-1 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
              <p>The requested page could not be found</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-screen bg-gray-50 p-4">
      <div className="h-full flex space-x-4 rounded-lg overflow-hidden shadow-lg">
        {/* Sidebar */}
        <Sidebar 
          onNavigate={handleNavigate}
          activeRoute={activeRoute}
          onAccountSelect={handleAccountSelect}
          selectedAccountId={selectedAccountId}
        />
        
        {/* Main Content Area */}
        <div className="flex-1 flex space-x-4 min-h-0">
          {/* Email List - 在inbox路由且未扩展时显示 */}
          {activeRoute === 'inbox' && !isDetailExpanded && (
            <div className="flex-shrink-0 min-w-[320px] max-w-[33vw] w-full md:w-[820px] transition-all duration-300 min-h-0">
              {renderMainContent()}
            </div>
          )}
          
          {/* Email Detail - 只在inbox路由显示 */}
          {activeRoute === 'inbox' && (
            <div
              className={`transition-all duration-300 min-h-0 flex-1 overflow-x-hidden`}
            >
              <EmailDetail 
                email={selectedEmail} 
                isExpanded={isDetailExpanded}
                onExpand={handleDetailExpand}
                onBack={handleDetailBack}
                accountId={selectedAccountId}
              />
            </div>
          )}
          
          {/* 其他路由正常展示 */}
          {activeRoute !== 'inbox' && (
            <div className="flex-1 min-h-0">
              {renderMainContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MailInbox; 