import React, { useState } from 'react';

interface AddEmailAccountModalProps {
  onClose: () => void;
}

const AddEmailAccountModal: React.FC<AddEmailAccountModalProps> = ({ onClose }) => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    imapHost: '',
    imapPort: '',
    imapEncryption: 'SSL/TLS',
    smtpHost: '',
    smtpPort: '',
    smtpEncryption: 'SSL/TLS',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: handle email account binding
    onClose();
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
        <h2 className="text-xl font-semibold mb-6 text-gray-900">Add Email Account</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Account Info */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@example.com"
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
                  name="imapHost"
                  value={form.imapHost}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1 border border-gray-300 rounded-lg"
                  placeholder="imap.example.com"
                />
              </div>
              <div className="w-24">
                <label className="block text-xs text-gray-600 mb-1">Port</label>
                <input
                  type="number"
                  name="imapPort"
                  value={form.imapPort}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1 border border-gray-300 rounded-lg"
                  placeholder="993"
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
                  name="smtpHost"
                  value={form.smtpHost}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1 border border-gray-300 rounded-lg"
                  placeholder="smtp.example.com"
                />
              </div>
              <div className="w-24">
                <label className="block text-xs text-gray-600 mb-1">Port</label>
                <input
                  type="number"
                  name="smtpPort"
                  value={form.smtpPort}
                  onChange={handleChange}
                  required
                  className="w-full px-2 py-1 border border-gray-300 rounded-lg"
                  placeholder="465"
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
              >
                <option value="SSL/TLS">SSL/TLS</option>
                <option value="STARTTLS">STARTTLS</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow"
            >
              Add Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmailAccountModal; 