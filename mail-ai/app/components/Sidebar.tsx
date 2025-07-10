'use client';

import React, { useState } from 'react';
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
  Plus
} from 'lucide-react';
import AddEmailAccountModal from './AddEmailAccountModal';
// import AddEmailAccountModal from './AddEmailAccountModal';

interface SidebarProps {
  onNavigate: (route: string) => void;
  activeRoute: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, activeRoute }) => {
  const [selectedEmail, setSelectedEmail] = useState('nathan@example.com');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const emailAccounts = [
    'nathan@example.com',
    'work@company.com',
    'personal@gmail.com'
  ];

  const menuItems = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: 12 },
    { id: 'drafts', label: 'Drafts', icon: FileText, count: 3 },
    { id: 'sent', label: 'Sent', icon: Send, count: 0 },
    { id: 'junk', label: 'Junk', icon: Shield, count: 5 },
    { id: 'trash', label: 'Trash', icon: Trash2, count: 0 },
    { id: 'archive', label: 'Archive', icon: Archive, count: 0 },
    { id: 'todo', label: 'To-Do', icon: CheckSquare, count: 8 },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot, count: 0 }
  ];

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
              {emailAccounts.map((email) => (
                <button
                  key={email}
                  onClick={() => {
                    setSelectedEmail(email);
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg"
                >
                  {email}
                </button>
              ))}
              {/* 添加邮箱选项 */}
              <button
                onClick={() => {
                  setShowAddModal(true);
                  setIsDropdownOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 border-t border-gray-100 last:rounded-b-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Email Account
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
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
      </nav>

      {/* 添加邮箱弹窗 */}
      {showAddModal && (
        <AddEmailAccountModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
};

export default Sidebar; 