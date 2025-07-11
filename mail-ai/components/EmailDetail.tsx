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
    partID?: string; // Added partID to the interface
  }>;
  flags: string[];
  uid: number;
}

interface EmailDetailProps {
  email: Email | null;
  isExpanded?: boolean;
  onExpand?: () => void;
  onBack?: () => void;
  accountId: number | null; // 新增
}

const EmailDetail: React.FC<EmailDetailProps> = ({ email, isExpanded = false, onExpand, onBack, accountId }) => {
  if (!email) {
    return (
      <div className="w-full h-full bg-white border-l border-gray-200 rounded-r-lg flex items-center justify-center">
        <div className="text-center text-gray-500">
          <Mail className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p className="text-lg font-medium">Select an email to read</p>
          <p className="text-sm">Choose an email from the list to view its contents</p>
        </div>
      </div>
    );
  }

  const handleDownload = async (attachment: any) => {
    if (!accountId) {
      alert('未选择邮箱账户');
      return;
    }
    if (!email) {
      alert('未选择邮件');
      return;
    }
    console.log('download params', {
      accountId,
      uid: email.uid,
      partID: attachment.partID,
      filename: attachment.filename,
      attachment,
      email,
    });
    const supabase = createClient();
    const { data } = await supabase.auth.getSession();
    const accessToken = data.session?.access_token;
    if (!accessToken) {
      alert('请先登录');
      return;
    }
    const url = `/api/mails/attachment?accountId=${accountId}&uid=${email.uid}&partID=${encodeURIComponent(attachment.partID)}&filename=${encodeURIComponent(attachment.filename)}`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!res.ok) {
      alert('下载失败，请重试');
      return;
    }
    const blob = await res.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = attachment.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="w-full h-full bg-white border-l border-gray-200 rounded-r-lg flex flex-col min-h-0">
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
              <Star className={`w-5 h-5 ${email.flags.includes('\\Flagged') ? 'text-yellow-500 fill-current' : ''}`} />
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
                <h3 className="text-sm font-medium text-gray-900">{email.from}</h3>
                <p className="text-xs text-gray-500">to {email.to}</p>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{new Date(email.date).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Content - 滚动区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className={`prose prose-sm max-w-none ${isExpanded ? 'max-w-4xl mx-auto' : ''}`}>
          {email.html ? (
            <div 
              className="text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: email.html }}
            />
          ) : (
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {email.text}
            </div>
          )}
        </div>

        {/* Attachments */}
        {email.attachments && email.attachments.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Attachments</h4>
            <div className="space-y-2">
              {email.attachments.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-sm text-gray-700">{attachment.filename}</span>
                      <p className="text-xs text-gray-500">
                        {attachment.contentType} • {(attachment.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  {attachment.partID && (
                    <button
                      className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                      title="Download attachment"
                      onClick={() => handleDownload(attachment)}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
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