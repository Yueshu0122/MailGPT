'use client';

import React, { useState } from 'react';
import { Search, Star, Clock, User, Mail } from 'lucide-react';

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

interface InboxProps {
  onEmailSelect: (email: Email) => void;
  selectedEmail: Email | null;
}

const Inbox: React.FC<InboxProps> = ({ onEmailSelect, selectedEmail }) => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock email data - 30封
  const emails: Email[] = Array.from({ length: 30 }, (_, i) => ({
    id: (i + 1).toString(),
    sender: `Sender ${i + 1}`,
    subject: `Test Email Subject ${i + 1}`,
    preview: `This is a preview of email number ${i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
    time: `${8 + (i % 12)}:${(i * 7) % 60 < 10 ? '0' : ''}${(i * 7) % 60} ${i % 2 === 0 ? 'AM' : 'PM'}`,
    isRead: i % 3 === 0,
    isStarred: i % 5 === 0,
    hasAttachment: i % 4 === 0
  }));

  const filteredEmails = emails.filter(email => {
    const matchesFilter = filter === 'all' || (filter === 'unread' && !email.isRead);
    const matchesSearch = email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         email.preview.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex-1 bg-white rounded-lg border border-gray-200 flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-semibold text-gray-900">Inbox</h1>
          <div className="flex items-center space-x-2">
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
        {filteredEmails.map((email) => (
          <div
            key={email.id}
            onClick={() => onEmailSelect(email)}
            className={`p-4 border-b border-gray-100 cursor-pointer transition-colors hover:bg-gray-50 ${
              selectedEmail?.id === email.id ? 'bg-blue-50 border-blue-200' : ''
            } ${!email.isRead ? 'bg-blue-50' : ''}`}
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
                    <span className={`font-medium text-sm ${!email.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                      {email.sender}
                    </span>
                    {!email.isRead && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{email.time}</span>
                    {email.isStarred && (
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    )}
                  </div>
                </div>
                
                <h3 className={`text-sm font-medium mt-1 ${!email.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                  {email.subject}
                </h3>
                
                <p className="text-sm text-gray-600 mt-1 truncate">
                  {email.preview}
                </p>
                
                <div className="flex items-center space-x-2 mt-2">
                  {email.hasAttachment && (
                    <div className="flex items-center space-x-1">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span className="text-xs text-gray-500">Attachment</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {filteredEmails.length === 0 && (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No emails found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox; 