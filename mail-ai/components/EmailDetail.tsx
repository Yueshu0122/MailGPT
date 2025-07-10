'use client';

import React from 'react';
import { 
  Star, 
  Trash2, 
  Reply, 
  Forward, 
  MoreVertical, 
  User, 
  Mail, 
  Calendar,
  Download,
  ArrowLeft,
  Maximize2,
  Minimize2
} from 'lucide-react';

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

interface EmailDetailProps {
  email: Email | null;
  isExpanded?: boolean;
  onExpand?: () => void;
  onBack?: () => void;
}

const EmailDetail: React.FC<EmailDetailProps> = ({ email, isExpanded = false, onExpand, onBack }) => {
  if (!email) {
    return (
      <div className="w-full bg-white border-l border-gray-200 rounded-r-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Select an email to read</p>
          <p className="text-sm">Choose an email from the list to view its contents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white border-l border-gray-200 rounded-r-lg flex flex-col h-full min-h-0">
      {/* Header with Actions */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {isExpanded && onBack && (
              <button
                onClick={onBack}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="收起详情"
              >
                <Minimize2 className="w-5 h-5" />
              </button>
            )}
            {!isExpanded && onExpand && (
              <button
                onClick={onExpand}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="展开详情"
              >
                <Maximize2 className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {email.subject}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:text-yellow-500 hover:bg-gray-100 rounded-lg transition-colors">
              <Star className={`w-5 h-5 ${email.isStarred ? 'text-yellow-500 fill-current' : ''}`} />
            </button>
            <button className="p-2 text-gray-600 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Reply className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Forward className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sender Info */}
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{email.sender}</h3>
                <p className="text-xs text-gray-500">to me</p>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{email.time}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Content - 滚动区域 */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4">
        <div className={`prose prose-sm max-w-none ${isExpanded ? 'max-w-4xl mx-auto' : ''}`}>
          <p className="text-gray-700 leading-relaxed mb-4">
            Hi there,
          </p>
          
          <p className="text-gray-700 leading-relaxed mb-4">
            {email.preview}
          </p>
          
          <p className="text-gray-700 leading-relaxed mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          
          <p className="text-gray-700 leading-relaxed mb-4">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
          
          <p className="text-gray-700 leading-relaxed mb-4">
            Best regards,<br />
            {email.sender}
          </p>
        </div>

        {/* Attachments */}
        {email.hasAttachment && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Attachments</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">project_update.pdf</span>
                </div>
                <button className="p-1 text-gray-500 hover:text-blue-600 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-700">presentation.pptx</span>
                </div>
                <button className="p-1 text-gray-500 hover:text-blue-600 transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reply Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Reply className="w-4 h-4" />
            <span className="text-sm font-medium">Reply</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
            <Forward className="w-4 h-4" />
            <span className="text-sm font-medium">Forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailDetail; 