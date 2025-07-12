'use client';

import React from 'react';
import { useChat } from '@ai-sdk/react';
import { Send, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface ChatbotProps {
  className?: string;
}

export default function Chatbot({ className = '' }: ChatbotProps) {
  const { 
    messages, 
    input, 
    handleInputChange, 
    handleSubmit, 
    status, 
    error, 
    stop, 
    reload 
  } = useChat({
    api: '/api/chat',
  });

  return (
    <div className={`flex flex-col h-full bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <h2 className="text-lg font-semibold text-gray-900">AI Assistant</h2>
        <p className="text-sm text-gray-600">Ask me anything about your emails and tasks</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-blue-500" />
              </div>
              <p className="text-lg font-medium mb-2">Welcome to AI Assistant</p>
              <p className="text-sm">Start a conversation to get help with your emails and tasks</p>
            </div>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {message.role === 'user' ? 'You' : 'AI Assistant'}
                </div>
                <div className="text-sm whitespace-pre-wrap">
                  {message.content}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Loading State */}
        {(status === 'submitted' || status === 'streaming') && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">
                  {status === 'submitted' ? 'Thinking...' : 'Responding...'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex justify-start">
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg px-4 py-2 max-w-[80%]">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Something went wrong</span>
              </div>
              <p className="text-sm mb-2">An error occurred while processing your request.</p>
              <button
                onClick={() => reload()}
                className="flex items-center space-x-1 text-xs text-red-600 hover:text-red-800 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            name="prompt"
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            disabled={status !== 'ready' || error != null}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={status !== 'ready' || error != null || !input.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
          >
            {status === 'streaming' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send</span>
              </>
            )}
          </button>
        </form>
        
        {/* Stop Button */}
        {status === 'streaming' && (
          <div className="mt-2">
            <button
              onClick={() => stop()}
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              Stop generating
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 