import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface AddEmailAccountModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const AddEmailAccountModal: React.FC<AddEmailAccountModalProps> = ({ onClose, onSuccess }) => {
  const [form, setForm] = useState({
    emailAddress: '',
    password: '',
    imapServerAddress: '',
    imapServerPort: '',
    imapEncryption: 'SSL/TLS',
    smtpServerAddress: '',
    smtpServerPort: '',
    smtpEncryption: 'SSL/TLS',
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // 获取当前用户的 access_token
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();
      const accessToken = data.session?.access_token;
      if (!accessToken) {
        showMessage('error', 'No access token, please login again.');
        setIsLoading(false);
        return;
      }
      const res = await fetch('/api/mail/accounts/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(form),
      });
      const result = await res.json();
      
      if (result.success) {
        showMessage('success', 'Email account added successfully!');
        // 调用成功回调
        if (onSuccess) {
          onSuccess();
        }
        setTimeout(() => onClose(), 3000); // 3秒后关闭弹窗
      } else {
        showMessage('error', 'Failed to add account');
      }
    } catch (err) {
      showMessage('error', 'Failed to add account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-8 relative border border-gray-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-xl font-bold"
          aria-label="Close"
        >
          ×
        </button>
        {/* 只有不是 success 时才显示标题 */}
        {!(message && message.type === 'success') && (
          <h2 className="text-xl font-semibold mb-6 text-gray-900">Add Email Account</h2>
        )}
        {/* 消息提示 */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-700 border border-green-200' 
              : 'bg-red-100 text-red-700 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}
        {/* 只有 success 时隐藏表单，其他情况都显示表单 */}
        {!(message && message.type === 'success') && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Account Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="emailAddress"
                value={form.emailAddress}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="user@example.com"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password / App Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Email password or app password"
                disabled={isLoading}
              />
            </div>

            {/* IMAP Config */}
            <div className="border-t border-gray-200 pt-4">
              <div className="font-semibold text-gray-800 mb-2">IMAP Settings (Incoming)</div>
              <div className="flex space-x-2 mb-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">IMAP Server</label>
                  <input
                    type="text"
                    name="imapServerAddress"
                    value={form.imapServerAddress}
                    onChange={handleChange}
                    required
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg"
                    placeholder="imap.example.com"
                    disabled={isLoading}
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs text-gray-600 mb-1">Port</label>
                  <input
                    type="number"
                    name="imapServerPort"
                    value={form.imapServerPort}
                    onChange={handleChange}
                    required
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg"
                    placeholder="993"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Encryption</label>
                <select
                  name="imapEncryption"
                  value={form.imapEncryption}
                  onChange={handleChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-lg"
                  disabled={isLoading}
                >
                  <option value="SSL/TLS">SSL/TLS</option>
                  <option value="STARTTLS">STARTTLS</option>
                </select>
              </div>
            </div>

            {/* SMTP Config */}
            <div className="border-t border-gray-200 pt-4">
              <div className="font-semibold text-gray-800 mb-2">SMTP Settings (Outgoing)</div>
              <div className="flex space-x-2 mb-2">
                <div className="flex-1">
                  <label className="block text-xs text-gray-600 mb-1">SMTP Server</label>
                  <input
                    type="text"
                    name="smtpServerAddress"
                    value={form.smtpServerAddress}
                    onChange={handleChange}
                    required
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg"
                    placeholder="smtp.example.com"
                    disabled={isLoading}
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs text-gray-600 mb-1">Port</label>
                  <input
                    type="number"
                    name="smtpServerPort"
                    value={form.smtpServerPort}
                    onChange={handleChange}
                    required
                    className="w-full px-2 py-1 border border-gray-300 rounded-lg"
                    placeholder="465"
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Encryption</label>
                <select
                  name="smtpEncryption"
                  value={form.smtpEncryption}
                  onChange={handleChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded-lg"
                  disabled={isLoading}
                >
                  <option value="SSL/TLS">SSL/TLS</option>
                  <option value="STARTTLS">STARTTLS</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow flex items-center justify-center min-w-[120px]"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Loading...
                  </span>
                ) : (
                  'Add Account'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddEmailAccountModal; 