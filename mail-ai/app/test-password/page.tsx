'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface EmailAccount {
  id: number;
  emailAddress: string;
  encryptedPassword: string;
  imapServerAddress: string;
  smtpServerAddress: string;
  createdAt: string;
}

export default function TestPasswordPage() {
  const [emailAccounts, setEmailAccounts] = useState<EmailAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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

  // 测试获取密码
  const testGetPassword = async (accountId: number) => {
    try {
      setIsLoadingPassword(true);
      setPasswordError(null);
      setPassword(null);
      
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const accessToken = session?.access_token;
      
      if (!accessToken) {
        setPasswordError('No access token, please login again.');
        return;
      }

      // 直接调用获取邮件的API来测试密码获取
      const response = await fetch(`/api/mails/get?accountId=${accountId}&limit=1`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();
      
      if (result.success) {
        setPassword('Password retrieved successfully! (Check console for details)');
        console.log('Password retrieval test successful:', result);
      } else {
        setPasswordError(result.error || 'Failed to retrieve password');
      }
    } catch (err) {
      setPasswordError('Failed to retrieve password');
      console.error('Error retrieving password:', err);
    } finally {
      setIsLoadingPassword(false);
    }
  };

  useEffect(() => {
    fetchEmailAccounts();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Password Retrieval</h1>
        <p>Loading email accounts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Test Password Retrieval</h1>
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Password Retrieval</h1>
      
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

          {/* 密码测试 */}
          {selectedAccount && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Password Retrieval Test:</h2>
                <button
                  onClick={() => testGetPassword(selectedAccount)}
                  disabled={isLoadingPassword}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {isLoadingPassword ? 'Testing...' : 'Test Password Retrieval'}
                </button>
              </div>

              {passwordError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <p className="text-red-600">{passwordError}</p>
                </div>
              )}

              {password && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <p className="text-green-600">{password}</p>
                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold mb-2">Test Details:</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>This test calls the /api/mails/get endpoint</li>
                  <li>It will attempt to retrieve the password using vault.decrypted_secrets</li>
                  <li>Check the browser console for detailed logs</li>
                  <li>If successful, the password retrieval worked correctly</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Instructions:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
          <li>Select an email account from the dropdown</li>
          <li>Click "Test Password Retrieval" to test the new vault.decrypted_secrets method</li>
          <li>Check the browser console for SQL query logs</li>
          <li>If the test succeeds, the password retrieval is working correctly</li>
        </ul>
      </div>
    </div>
  );
} 