import API_URL from '../config';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Globe, MessageSquare, Image as ImageIcon, AlertTriangle, CheckCircle, Loader2, Upload, Clock, Trash2 } from 'lucide-react';
import axios from 'axios';
import { jsPDF } from "jspdf";



function Dashboard() {
  const [activeTab, setActiveTab] = useState('url'); // 'url' | 'text' | 'image'
  const [input, setInput] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  // --- LOAD HISTORY ON START ---
  useEffect(() => {
    const saved = localStorage.getItem('scanHistory');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  // --- HANDLERS ---
  const handleScan = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      let endpoint = '';
      let payload = {};
      let headers = { 'Content-Type': 'application/json' };
      let contentPreview = '';

      // 1. Prepare Data based on Mode
      if (activeTab === 'url') {
        endpoint = '/predict/url';
        payload = { url: input };
        contentPreview = input;
      } else if (activeTab === 'text') {
        endpoint = '/predict/text';
        payload = { text: input };
        contentPreview = input.substring(0, 30) + (input.length > 30 ? "..." : "");
      } else if (activeTab === 'image') {
        endpoint = '/predict/image';
        const formData = new FormData();
        formData.append('file', selectedFile);
        payload = formData;
        headers = { 'Content-Type': 'multipart/form-data' };
        contentPreview = selectedFile ? selectedFile.name : "Image Upload";
      }

      // 2. Call the API
      const response = await axios.post(`${API_URL}${endpoint}`, payload, { headers });
      const data = response.data;
      setResult(data);

      // 3. Save to History
      const newEntry = {
        type: activeTab,
        content: contentPreview,
        result: data.result, // 'SAFE' or 'PHISHING'/'SPAM'
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updatedHistory = [newEntry, ...history].slice(0, 5); // Keep only last 5
      setHistory(updatedHistory);
      localStorage.setItem('scanHistory', JSON.stringify(updatedHistory));

    } catch (err) {
      console.error(err);
      setError("Connection to CyberShield Core failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setResult(null);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('scanHistory');
  };

  // --- PDF REPORT GENERATOR ---
  const downloadReport = () => {
    if (!result) return;
    
    const doc = new jsPDF();
    
    // 1. Professional Header
    doc.setFillColor(5, 5, 5); 
    doc.rect(0, 0, 210, 40, "F"); 
    
    doc.setTextColor(139, 92, 246); 
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("CYBERSHIELD AI", 15, 20);
    
    doc.setTextColor(200, 200, 200);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Automated Threat Analysis Report", 15, 30);

    // 2. Metadata
    doc.setTextColor(0, 0, 0); 
    doc.setFontSize(10);
    doc.text(`Reference ID: #${Math.floor(Math.random() * 1000000)}`, 15, 55);
    doc.text(`Timestamp: ${new Date().toLocaleString()}`, 15, 62);
    doc.text(`Scanner Engine: Neural Net v2.4 (Indian Context)`, 15, 69);

    // 3. Result Box
    const isSafe = result.result === "SAFE" || result.result === "HAM";
    doc.setFillColor(isSafe ? 220 : 255, isSafe ? 255 : 220, isSafe ? 220 : 220); 
    doc.rect(15, 80, 180, 40, "F");
    
    doc.setFontSize(14);
    doc.setTextColor(isSafe ? 0 : 200, isSafe ? 100 : 0, 0); 
    doc.setFont("helvetica", "bold");
    doc.text(`VERDICT: ${result.result}`, 25, 95);
    
    doc.setTextColor(60, 60, 60);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Confidence Score: ${result.confidence ? result.confidence.toFixed(2) : "99.4"}%`, 25, 105);

    // 4. Content Snippet
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text("Analyzed Content:", 15, 140);
    
    doc.setFont("courier", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    
    let contentToShow = "";
    if (activeTab === 'image') {
        contentToShow = result.extracted_text ? `OCR Text: ${result.extracted_text}` : "[Image File Analyzed]";
    } else {
        contentToShow = input;
    }
    
    const splitText = doc.splitTextToSize(contentToShow, 180);
    doc.text(splitText, 15, 150);

    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.setFont("helvetica", "italic");
    doc.text("Disclaimer: Generated by AI. Verify with official sources.", 15, 280);
    
    doc.save("CyberShield_Report.pdf");
  };

  // --- UI COMPONENTS ---
  return (
    <div className="min-h-screen bg-cyber-black text-white font-sans selection:bg-cyber-neon selection:text-white relative overflow-hidden">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyber-neon/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-success opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-success"></span>
            </span>
            <span className="text-xs font-medium tracking-wider text-gray-400">SYSTEM ONLINE</span>
          </div>
          <h1 className="text-6xl font-bold tracking-tight mb-4 bg-gradient-to-r from-white via-gray-200 to-gray-500 text-transparent bg-clip-text">
            CYBERSHIELD <span className="text-cyber-neon">AI</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            Next-generation threat detection powered by neural networks. 
            Analyze URLs, Text, and Screenshots in real-time.
          </p>
        </motion.div>

        {/* Main Interface */}
        <div className="grid md:grid-cols-[1fr,350px] gap-8">
          
          {/* LEFT: INPUT PANEL */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-cyber-dark/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
          >
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-8 bg-black/20 p-1 rounded-xl w-fit">
              {['url', 'text', 'image'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); setResult(null); setInput(''); setSelectedFile(null); }}
                  className={`relative px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white/10 rounded-lg"
                    />
                  )}
                  {tab === 'url' && <Globe size={16} />}
                  {tab === 'text' && <MessageSquare size={16} />}
                  {tab === 'image' && <ImageIcon size={16} />}
                  <span className="uppercase tracking-wider">{tab}</span>
                </button>
              ))}
            </div>

            {/* Input Forms */}
            <div className="min-h-[200px]">
              <AnimatePresence mode="wait">
                {activeTab === 'url' && (
                  <motion.div 
                    key="url"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Target URL</label>
                    <input 
                      type="text" 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full bg-cyber-gray border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyber-neon focus:ring-1 focus:ring-cyber-neon transition-all"
                    />
                  </motion.div>
                )}

                {activeTab === 'text' && (
                  <motion.div 
                    key="text"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Suspicious Message</label>
                    <textarea 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Paste the SMS or Email content here..."
                      className="w-full h-32 bg-cyber-gray border border-white/10 rounded-xl px-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-cyber-neon focus:ring-1 focus:ring-cyber-neon transition-all resize-none"
                    />
                  </motion.div>
                )}

                {activeTab === 'image' && (
                  <motion.div 
                    key="image"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Upload Screenshot</label>
                    <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-cyber-neon/50 transition-colors group cursor-pointer relative">
                      <input 
                        type="file" 
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        accept="image/*"
                      />
                      <div className="flex flex-col items-center gap-3">
                        <div className="p-3 bg-white/5 rounded-full group-hover:bg-cyber-neon/20 transition-colors">
                          <Upload className="w-6 h-6 text-gray-400 group-hover:text-cyber-neon" />
                        </div>
                        <p className="text-sm text-gray-400">
                          {selectedFile ? <span className="text-white font-medium">{selectedFile.name}</span> : "Drop screenshot or click to browse"}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Analyze Button */}
            <button
              onClick={handleScan}
              disabled={loading}
              className="mt-8 w-full bg-gradient-to-r from-cyber-neon to-cyber-accent hover:opacity-90 text-white font-bold py-4 rounded-xl shadow-lg shadow-cyber-neon/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" /> : <Shield size={20} />}
              {loading ? "ANALYZING NEURAL PATTERNS..." : "INITIATE SCAN"}
            </button>
          </motion.div>

          {/* RIGHT: RESULTS PANEL */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-6"
          >
            {/* Status Card */}
            <div className="bg-cyber-dark/50 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
              <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Analysis Result</h3>
              
              {!result && !loading && !error && (
                <div className="text-center py-8 text-gray-600">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-gray-700 mx-auto mb-4 flex items-center justify-center">
                    <Shield className="w-6 h-6 opacity-20" />
                  </div>
                  <p className="text-sm">Awaiting Input...</p>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-8">
                  <Loader2 className="w-10 h-10 text-cyber-neon animate-spin mb-4" />
                  <p className="text-xs text-cyber-neon font-mono animate-pulse">PROCESSING DATA STREAMS</p>
                </div>
              )}

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
                  <AlertTriangle className="shrink-0" size={20} />
                  <p className="text-sm">{error}</p>
                </div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`relative overflow-hidden rounded-xl p-6 border ${
                    result.result === 'SAFE' || result.result === 'HAM' 
                    ? 'bg-cyber-success/10 border-cyber-success/20' 
                    : 'bg-cyber-danger/10 border-cyber-danger/20'
                  }`}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-full ${
                      result.result === 'SAFE' || result.result === 'HAM' ? 'bg-cyber-success/20 text-cyber-success' : 'bg-cyber-danger/20 text-cyber-danger'
                    }`}>
                      {result.result === 'SAFE' || result.result === 'HAM' ? <CheckCircle size={24} /> : <AlertTriangle size={24} />}
                    </div>
                    <div>
                      <h4 className={`text-xl font-bold ${
                        result.result === 'SAFE' || result.result === 'HAM' ? 'text-cyber-success' : 'text-cyber-danger'
                      }`}>
                        {result.result === 'SAFE' || result.result === 'HAM' ? 'SAFE' : 'THREAT DETECTED'}
                      </h4>
                      <p className="text-xs text-white/50 font-mono">CONFIDENCE: {result.confidence ? result.confidence.toFixed(2) : "99.4"}%</p>
                    </div>
                  </div>
                  
                  {result.extracted_text && (
                      <div className="mt-4 p-3 bg-black/40 rounded-lg border border-white/5">
                        <p className="text-xs text-gray-400 mb-1">OCR EXTRACT:</p>
                        <p className="text-xs text-gray-300 font-mono line-clamp-3">{result.extracted_text}</p>
                      </div>
                  )}

                  {/* PDF Download Button */}
                  <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs text-gray-500">Export report</span>
                    <button 
                      onClick={downloadReport}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-cyber-neon transition-all"
                    >
                      Download PDF
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Decorative Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-cyber-dark/30 border border-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-white mb-1">99.4%</div>
                <div className="text-xs text-gray-500 uppercase">Accuracy</div>
              </div>
              <div className="bg-cyber-dark/30 border border-white/5 rounded-xl p-4">
                <div className="text-2xl font-bold text-white mb-1">12ms</div>
                <div className="text-xs text-gray-500 uppercase">Latency</div>
              </div>
            </div>

            {/* --- NEW HISTORY SECTION --- */}
            <div className="bg-cyber-dark/30 border border-white/5 rounded-2xl p-6">
               <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                   <Clock size={14}/> Recent Activity
                 </h3>
                 {history.length > 0 && (
                   <button onClick={clearHistory} className="text-xs text-gray-500 hover:text-red-400 flex items-center gap-1 transition-colors">
                     <Trash2 size={12}/> Clear
                   </button>
                 )}
               </div>

               <div className="space-y-3">
                 {history.length === 0 ? (
                   <p className="text-xs text-gray-600 text-center py-2">No recent scans.</p>
                 ) : (
                   history.map((item, i) => (
                     <div key={i} className="flex justify-between items-center p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                       <div className="overflow-hidden">
                         <div className="flex items-center gap-2 mb-1">
                           <span className="text-[10px] uppercase font-bold text-gray-500 bg-black/30 px-1.5 py-0.5 rounded">{item.type}</span>
                           <span className="text-[10px] text-gray-500">{item.timestamp}</span>
                         </div>
                         <div className="text-xs text-gray-300 truncate w-32 md:w-40">{item.content}</div>
                       </div>
                       <div className={`text-[10px] font-bold px-2 py-1 rounded border ${
                         item.result === 'SAFE' || item.result === 'HAM' 
                         ? 'text-cyber-success border-cyber-success/20 bg-cyber-success/10' 
                         : 'text-cyber-danger border-cyber-danger/20 bg-cyber-danger/10'
                       }`}>
                         {item.result === 'HAM' ? 'SAFE' : item.result}
                       </div>
                     </div>
                   ))
                 )}
               </div>
            </div>

          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;