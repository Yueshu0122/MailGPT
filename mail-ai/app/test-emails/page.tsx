'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface EmailAccount {
  id: number;
  emailAddress: string;
  imapServerAddress: string;
  smtpServerAddress: string;
  createdAt: string;
}

interface EmailMessage {
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

export default function TestEmailsPage() {
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingEmails, setIsLoadingEmails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<EmailMessage | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // 获取邮箱账户列表
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
        if (result.accounts && result.accounts.length > 0) {
          setSelectedAccount(result.accounts[0].id);
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

  // 获取邮件详情
  const fetchEmailDetail = async (accountId: number, emailUid: number) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        setEmailError('No access token, please login again.');
        return;
      }

      const response = await fetch(`/api/mails/detail?accountId=${accountId}&uid=${emailUid}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        return result.email;
      } else {
        console.error('Failed to fetch email detail:', result.error);
        return null;
      }
    } catch (err) {
      console.error('Error fetching email detail:', err);
      return null;
    }
  };

  // 获取邮件
  const fetchEmails = async (accountId: number) => {
    try {
      setIsLoadingEmails(true);
      setEmailError(null);
      
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        setEmailError('No access token, please login again.');
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
        setEmailError(result.error || 'Failed to fetch emails');
      }
    } catch (err) {
      setEmailError('Failed to fetch emails');
      console.error('Error fetching emails:', err);
    } finally {
      setIsLoadingEmails(false);
    }
  };

  useEffect(() => {
    fetchEmailAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      fetchEmails(selectedAccount);
    }
  }, [selectedAccount]);

  // 处理邮件点击
  const handleEmailClick = async (email: EmailMessage) => {
    if (!selectedAccount) return;
    
    setSelectedEmail(email);
    setIsDetailModalOpen(true);
    
    // 如果邮件没有正文，尝试获取详情
    if (!email.text && email.uid) {
      const detailedEmail = await fetchEmailDetail(selectedAccount, email.uid);
      if (detailedEmail) {
        setSelectedEmail(detailedEmail);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Email Fetching</h1>
        <p>Loading email accounts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Email Fetching</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Email Fetching</h1>
      
      {emailAccounts.length === 0 ? (
        <p className="text-gray-500">No email accounts found. Please add an email account first.</p>
      ) : (
        <div className="space-y-6">
          {/* 邮箱账户选择 */}
          <div>
            <h2 className="text-lg font-semibold mb-2">Select Email Account:</h2>
            <select
              value={selectedAccount || ''}
              onChange={(e) => setSelectedAccount(Number(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg"
            >
              {emailAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.emailAddress}
                </option>
              ))}
            </select>
          </div>

          {/* 邮件列表 */}
          {selectedAccount && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Emails:</h2>
                <button
                  onClick={() => fetchEmails(selectedAccount)}
                  disabled={isLoadingEmails}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isLoadingEmails ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {emailError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <p className="text-red-600">{emailError}</p>
                </div>
              )}

              {isLoadingEmails ? (
                <p>Loading emails...</p>
              ) : emails.length === 0 ? (
                <p className="text-gray-500">No emails found.</p>
              ) : (
                <div className="space-y-4">
                  {emails.map((email) => (
                    <div 
                      key={email.id} 
                      className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleEmailClick(email)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{email.subject}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            From: {email.from}
                          </p>
                          <p className="text-sm text-gray-600">
                            To: {email.to}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(email.date).toLocaleString()}
                          </p>
                          {email.text && (
                            <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                              {email.text.substring(0, 200)}...
                            </p>
                          )}
                          {email.attachments.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs text-gray-500">
                                Attachments: {email.attachments.length}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          {email.flags.includes('\\Seen') && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              Read
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 邮件详情模态框 */}
      {isDetailModalOpen && selectedEmail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Email Detail</h2>
              <button
                onClick={() => {
                  setIsDetailModalOpen(false);
                  setSelectedEmail(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{selectedEmail.subject}</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">From:</span>
                    <p className="text-gray-900">{selectedEmail.from}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">To:</span>
                    <p className="text-gray-900">{selectedEmail.to}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Date:</span>
                    <p className="text-gray-900">{new Date(selectedEmail.date).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Flags:</span>
                    <p className="text-gray-900">{selectedEmail.flags.join(', ') || 'None'}</p>
                  </div>
                </div>

                {selectedEmail.text && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Content:</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <pre className="whitespace-pre-wrap text-sm text-gray-900 font-sans">
                        {selectedEmail.text}
                      </pre>
                    </div>
                  </div>
                )}

                {selectedEmail.html && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">HTML Content:</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div 
                        className="text-sm text-gray-900"
                        dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
                      />
                    </div>
                  </div>
                )}

                {selectedEmail.attachments.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Attachments:</h4>
                    <div className="space-y-2">
                      {selectedEmail.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium text-gray-900">{attachment.filename}</p>
                            <p className="text-sm text-gray-600">{attachment.contentType}</p>
                          </div>
                          <span className="text-sm text-gray-500">
                            {(attachment.size / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>Select an email account from the dropdown</li>
          <li>Emails will be automatically fetched from the selected account</li>
          <li>Click on any email to view its details</li>
          <li>Click "Refresh" to fetch emails again</li>
          <li>Check the browser console for SQL query logs</li>
          <li>Make sure your email account credentials are correct</li>
        </ul>
      </div>
    </div>
  );
} 