import API_URL from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';



const Assistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I am CyberShield AI. Ask me anything about phishing, malware, or online safety.", from: 'bot' }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    // 1. Add User Message
    const userMsg = input;
    setMessages(prev => [...prev, { text: userMsg, from: 'user' }]);
    setInput("");
    setIsTyping(true); // Show typing indicator

    try {
      // 2. Call the Smart Backend API
      const response = await axios.post(`${API_URL}/chat`, { message: userMsg });
      
      // 3. Add AI Response
      setMessages(prev => [...prev, { text: response.data.reply, from: 'bot' }]);
      
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { text: "Network error. Please check your backend connection.", from: 'bot' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-80 md:w-96 bg-cyber-dark border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-cyber-neon p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot className="text-white" size={20}/>
                <div>
                  <div className="font-bold text-white text-sm">CyberShield Intelligence</div>
                  <div className="text-[10px] text-white/80 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span> Online
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)}><X size={18} className="text-white hover:text-gray-200"/></button>
            </div>
            
            {/* Chat Area */}
            <div className="h-80 p-4 overflow-y-auto space-y-3 bg-black/50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'bot' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed shadow-sm ${
                    m.from === 'bot' 
                    ? 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5' 
                    : 'bg-cyber-neon text-white rounded-tr-none'
                  }`}>
                    {/* Render markdown-style bolding if AI sends it */}
                    {m.text.split('**').map((part, i) => 
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                    )}
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 text-gray-400 p-3 rounded-xl rounded-tl-none border border-white/5 flex items-center gap-1 w-16">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-cyber-dark border-t border-white/10 flex gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about threats, safety..."
                className="flex-1 bg-black/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyber-neon placeholder-gray-500"
              />
              <button 
                onClick={handleSend} 
                disabled={isTyping}
                className="p-2 bg-cyber-neon rounded-lg text-white hover:bg-cyber-accent transition-colors disabled:opacity-50"
              >
                {isTyping ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group p-4 bg-cyber-neon hover:bg-cyber-accent rounded-full shadow-lg shadow-cyber-neon/30 text-white transition-all hover:scale-110 flex items-center justify-center relative"
      >
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        <MessageCircle size={28} />
      </button>
    </div>
  );
};

export default Assistant;