import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  Send, 
  Sparkles, 
  User, 
  Bot,
  Loader2,
  Trash2,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { api } from '../config';

const suggestedQuestions = [
  "What industry produces the most emissions?",
  "How can we reduce transportation emissions?",
  "Compare energy vs manufacturing emissions",
  "What are the trends in global emissions?"
];

export default function ChatPanel({ onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (messageText = input) => {
    if (!messageText.trim() || loading) return;

    const userMessage = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Build conversation history for context (last 20 messages)
      const chatHistory = messages.slice(-20).map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch(api.chat, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          history: chatHistory
        })
      });

      const data = await response.json();
      
      // Handle response 
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || 'Something went wrong. Please try again.',
        isUnavailable: data.source === 'unavailable'
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Unable to connect to the server. Please check your connection and try again.',
        isUnavailable: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className={`fixed right-0 top-0 h-screen bg-dark-900/95 backdrop-blur-xl border-l border-dark-700/50 z-40 flex flex-col shadow-2xl ${
        expanded ? 'w-full md:w-[600px]' : 'w-full md:w-[420px]'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-dark-700/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-lens flex items-center justify-center glow-sm">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-white">AI Assistant</h2>
            <p className="text-xs text-dark-400">Ask about emissions data</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
          >
            {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="p-2 text-dark-400 hover:text-red-400 hover:bg-dark-800 rounded-lg transition-colors"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-lens flex items-center justify-center mb-4 glow">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-display font-semibold text-white mb-2">
              Welcome to Emission Lens AI
            </h3>
            <p className="text-dark-400 text-sm mb-6 max-w-xs">
              I can help you explore and understand emissions data across industries and regions.
            </p>
            <div className="space-y-2 w-full max-w-sm">
              <p className="text-xs text-dark-500 uppercase tracking-wider mb-2">
                Try asking:
              </p>
              {suggestedQuestions.map((question) => (
                <button
                  key={question}
                  onClick={() => sendMessage(question)}
                  className="w-full text-left px-4 py-3 text-sm text-dark-300 bg-dark-800/50 border border-dark-700/30 rounded-xl hover:border-lens-500/30 hover:text-white transition-all"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-gradient-lens flex items-center justify-center flex-shrink-0">
                    <Bot size={16} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-lens-500 text-white'
                      : 'bg-dark-800 text-dark-100 border border-dark-700/30'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="markdown-content text-sm">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-lg bg-dark-700 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-dark-300" />
                  </div>
                )}
              </motion.div>
            ))}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-lens flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="bg-dark-800 border border-dark-700/30 rounded-2xl px-4 py-3">
                  <div className="flex items-center gap-2 text-dark-400">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-sm">Analyzing...</span>
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-dark-700/50">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about emissions data..."
            rows={1}
            className="w-full pl-4 pr-12 py-3 bg-dark-800/50 border border-dark-700/50 rounded-xl text-white placeholder-dark-500 focus:outline-none focus:border-lens-500/50 focus:ring-1 focus:ring-lens-500/20 transition-all resize-none"
            style={{ minHeight: '48px', maxHeight: '120px' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-gradient-lens rounded-lg flex items-center justify-center text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="mt-2 text-xs text-dark-500 text-center">
          AI responses are based on dashboard data. For real-time info, use Web Insights.
        </p>
      </div>
    </motion.div>
  );
}


