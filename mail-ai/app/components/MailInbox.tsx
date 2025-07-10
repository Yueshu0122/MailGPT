'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Inbox from './Inbox';
import EmailDetail from './EmailDetail';

interface Email {
  id: string;
  sender: string;
  subject: string;
  preview: string;
  time: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
}

const MailInbox: React.FC = () => {
  const [activeRoute, setActiveRoute] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [isDetailExpanded, setIsDetailExpanded] = useState(false);

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

  const renderMainContent = () => {
    switch (activeRoute) {
      case 'inbox':
        return (
          <Inbox 
            onEmailSelect={handleEmailSelect}
            selectedEmail={selectedEmail}
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
          <div className="flex-1 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <h2 className="text-xl font-semibold mb-2">To-Do</h2>
              <p>To-do items will appear here</p>
            </div>
          </div>
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
        />
        
        {/* Main Content Area */}
        <div className="flex-1 flex space-x-4">
          {/* Email List - 在inbox路由且未扩展时显示 */}
          {activeRoute === 'inbox' && !isDetailExpanded && (
            <div className="flex-1 transition-all duration-300">
              {renderMainContent()}
            </div>
          )}
          
          {/* Email Detail - 只在inbox路由显示 */}
          {activeRoute === 'inbox' && (
            <div
              className={`transition-all duration-300 ${
                isDetailExpanded ? 'flex-1' : 'w-96'
              }`}
            >
              <EmailDetail 
                email={selectedEmail} 
                isExpanded={isDetailExpanded}
                onExpand={handleDetailExpand}
                onBack={handleDetailBack}
              />
            </div>
          )}
          
          {/* 其他路由正常展示 */}
          {activeRoute !== 'inbox' && (
            <div className="flex-1">
              {renderMainContent()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MailInbox; 