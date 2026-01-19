import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Assistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I am CyberBot. I support 8+ Indian languages. How can I help?", from: 'bot' }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // --- MULTILINGUAL BRAIN ---
  const languageResponses = {
    // Tamil
    tamil: {
      keywords: ['vanakkam', 'udavi', 'tamil', 'eppadi'],
      reply: "வணக்கம்! இணைப்புகளை ஸ்கேன் செய்ய 'Check for Yourself' ஐ கிளிக் செய்யவும். உதவிக்கு 1930 ஐ அழைக்கவும்."
    },
    // Telugu
    telugu: {
      keywords: ['namaskaram', 'sahayam', 'telugu', 'ela'],
      reply: "నమస్కారం! లింక్‌లను స్కాన్ చేయడానికి 'Check for Yourself' క్లిక్ చేయండి. సహాయం కోసం 1930కి కాల్ చేయండి."
    },
    // Hindi
    hindi: {
      keywords: ['namaste', 'madad', 'hindi', 'kaise', 'kya'],
      reply: "नमस्ते! स्कैनिंग टूल का उपयोग करने के लिए 'Check for Yourself' पर क्लिक करें। सहायता के लिए 1930 डायल करें।"
    },
    // Bengali
    bengali: {
      keywords: ['namaskar', 'sahajjo', 'bangla', 'kemon'],
      reply: "নমস্কার! লিঙ্ক স্ক্যান করতে 'Check for Yourself' এ ক্লিক করুন। সাহায্যের জন্য 1930 ডায়াল করুন।"
    },
    // Kannada
    kannada: {
      keywords: ['namaskara', 'sahaya', 'kannada', 'hege'],
      reply: "ನಮಸ್ಕಾರ! ಲಿಂಕ್‌ಗಳನ್ನು ಸ್ಕ್ಯಾನ್ ಮಾಡಲು 'Check for Yourself' ಕ್ಲಿಕ್ ಮಾಡಿ. ಸಹಾಯಕ್ಕಾಗಿ 1930 ಕರೆ ಮಾಡಿ."
    },
    // Malayalam
    malayalam: {
      keywords: ['namaskaram', 'sahayam', 'malayalam', 'engane'],
      reply: "നമസ്കാരം! ലിങ്കുകൾ സ്കാൻ ചെയ്യാൻ 'Check for Yourself' ക്ലിക്ക് ചെയ്യുക. സഹായത്തിന് 1930 വിളിക്കുക."
    },
    // Marathi
    marathi: {
      keywords: ['namaskar', 'madat', 'marathi', 'kase'],
      reply: "नमस्कार! लिंक स्कॅन करण्यासाठी 'Check for Yourself' वर क्लिक करा. मदतीसाठी 1930 डायल करा."
    },
    // Gujarati
    gujarati: {
      keywords: ['namaste', 'madad', 'gujarati', 'kem'],
      reply: "નમસ્તે! લિંક સ્કેન કરવા માટે 'Check for Yourself' પર ક્લિક કરો. મદદ માટે 1930 ડાયલ કરો."
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { text: userMsg, from: 'user' }]);
    setInput("");

    setTimeout(() => {
      const lower = userMsg.toLowerCase();
      let reply = "I can help you navigate. Try asking in your local language like 'Vanakkam', 'Namaskaram', or 'Help'.";
      let matchFound = false;

      // 1. Check Specific Languages
      for (const lang in languageResponses) {
        if (languageResponses[lang].keywords.some(k => lower.includes(k))) {
          reply = languageResponses[lang].reply;
          matchFound = true;
          break;
        }
      }

      // 2. English Fallbacks if no language match
      if (!matchFound) {
        if (lower.includes('scan') || lower.includes('check') || lower.includes('demo')) {
          reply = "To scan a link or message, click the 'Check for Yourself' button on the Home page.";
        } else if (lower.includes('news') || lower.includes('fraud') || lower.includes('help')) {
          reply = "For fraud alerts and expert helplines, please visit our 'Education & Safety' page.";
        } else if (lower.includes('police') || lower.includes('number')) {
          reply = "Please dial 1930 immediately for the National Cyber Crime Helpline.";
        }
      }

      setMessages(prev => [...prev, { text: reply, from: 'bot' }]);
    }, 800);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 w-80 bg-cyber-dark border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            <div className="bg-cyber-neon p-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Bot className="text-white" size={20}/>
                <span className="font-bold text-white">Cyber Assistant</span>
              </div>
              <button onClick={() => setIsOpen(false)}><X size={18} className="text-white hover:text-gray-200"/></button>
            </div>
            
            <div className="h-72 p-4 overflow-y-auto space-y-3 bg-black/50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'bot' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[85%] p-3 rounded-xl text-sm leading-relaxed ${
                    m.from === 'bot' 
                    ? 'bg-white/10 text-gray-200 rounded-tl-none' 
                    : 'bg-cyber-neon text-white rounded-tr-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-3 bg-cyber-dark border-t border-white/10 flex gap-2">
              <input 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Type here (e.g., Vanakkam)..."
                className="flex-1 bg-black/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyber-neon placeholder-gray-500"
              />
              <button onClick={handleSend} className="p-2 bg-cyber-neon rounded-lg text-white hover:bg-cyber-accent transition-colors">
                <Send size={16}/>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group p-4 bg-cyber-neon hover:bg-cyber-accent rounded-full shadow-lg shadow-cyber-neon/30 text-white transition-all hover:scale-110 flex items-center justify-center relative"
      >
        {/* Notification Ping Animation */}
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        <MessageCircle size={28} />
      </button>
    </div>
  );
};

export default Assistant;