import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  BookOpen,
  HelpCircle,
  Compass,
} from 'lucide-react';
import aiService from '../services/aiService';

export const AIAssistantWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        'Hello! 👋 I am **Athena**, your AI Library Concierge. I can recommend books from our collection, provide chapter summaries, guide you on physical borrow applications (using Book Codes), or direct you to live e-content! How can I assist you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user', content: query.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.slice(-6); // last 6 messages
      const res = await aiService.askUserAssistant(query.trim(), history);
      if (res.success && res.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: res.reply }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: 'I am currently processing requests. Please check our catalog or ask another question!',
          },
        ]);
      }
    } catch (err) {
      const errorMessage = err?.message || err?.error || 'Please check the server connection and try again.';
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `I could not reach the library assistant right now. ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestionChips = [
    { label: '📖 Recommend a Classic', query: 'Recommend a classic book in our catalog with its Book Code' },
    { label: '🏛️ How to borrow physical book?', query: 'How does physical book borrowing work with Book Code?' },
    { label: '⚡ Digital E-Books', query: 'Which e-content books can I read live right now?' },
    { label: '🔬 Top Science Books', query: 'What science or technology books do you recommend?' },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Floating Toggle Trigger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-4 py-3 bg-primary-700 text-white rounded-full shadow-2xl hover:shadow-primary-500/40 transition-shadow duration-300 border border-white/30"
      >
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
          <Sparkles size={16} className="text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
        </div>
        <span className="font-semibold text-sm hidden sm:inline">AI Library Assistant</span>
        <span className="font-semibold text-sm sm:hidden">AI Bot</span>
      </motion.button>

      {/* Chat Window Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.25 }}
            className="absolute bottom-16 right-0 flex h-[min(520px,calc(100vh-7rem))] max-h-[80vh] w-[min(420px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-primary-200 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-slate-700 dark:bg-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-primary-700 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                    Athena • AI Concierge
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </h3>
                  <p className="text-[11px] text-blue-100">Powered by Groq LLaMA 3.3</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs sm:text-sm">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                        isUser
                          ? 'bg-primary-600 text-white'
                          : 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
                      }`}
                    >
                      {isUser ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div
                      className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl leading-relaxed ${
                        isUser
                          ? 'bg-primary-600 text-white rounded-tr-none'
                          : 'bg-gray-100 dark:bg-slate-700/70 text-gray-800 dark:text-slate-100 rounded-tl-none border border-gray-200/50 dark:border-slate-600/50'
                      }`}
                    >
                      {msg.content.split('\n').map((line, i) => (
                        <p key={i} className={i > 0 ? 'mt-1.5' : ''}>
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                    <Bot size={14} />
                  </div>
                  <div className="bg-gray-100 dark:bg-slate-700/70 px-4 py-3 rounded-2xl rounded-tl-none border border-gray-200/50 dark:border-slate-600/50">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-primary-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestion Chips */}
            <div className="px-3 py-2 bg-gray-50/80 dark:bg-slate-900/40 border-t border-gray-100 dark:border-slate-700 flex gap-1.5 overflow-x-auto no-scrollbar">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip.query)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-slate-700 text-[11px] font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 whitespace-nowrap transition-colors flex-shrink-0"
                >
                  {chip.label}
                </button>
              ))}
            </div>

            {/* Input Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white dark:bg-slate-800 border-t border-gray-100 dark:border-slate-700 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Athena about books, authors, borrowing..."
                disabled={loading}
                className="flex-1 text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-gray-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-slate-900 dark:text-white"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white transition-colors"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIAssistantWidget;
