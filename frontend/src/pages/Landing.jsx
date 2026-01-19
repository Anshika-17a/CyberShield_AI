import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Lock, Cpu, ArrowRight, Globe, CheckCircle } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen bg-cyber-black text-white relative overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyber-neon/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-32"
        >
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-cyber-neon/30 bg-cyber-neon/10 text-cyber-neon text-sm font-mono tracking-wider">
            SECURE YOUR DIGITAL LIFE
          </div>
          <h1 className="text-7xl font-bold mb-8 tracking-tight bg-gradient-to-br from-white via-gray-200 to-gray-600 text-transparent bg-clip-text">
            Advanced AI Protection <br />
            <span className="text-cyber-neon">Against Modern Scams</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            We provide enterprise-grade security for everyone. Detect Phishing URLs, 
            Fake SMS, and Malicious Screenshots in milliseconds using our Neural Engine.
          </p>
          
          <div className="flex justify-center gap-6">
            <Link to="/dashboard">
              <button className="group relative px-8 py-4 bg-cyber-neon text-white font-bold rounded-xl overflow-hidden transition-all hover:scale-105 shadow-lg shadow-cyber-neon/25">
                <span className="relative flex items-center gap-2">CHECK FOR YOURSELF <ArrowRight size={20} /></span>
              </button>
            </Link>
            <Link to="/education">
              <button className="px-8 py-4 border border-white/10 rounded-xl font-bold hover:bg-white/5 transition-all text-gray-300 hover:text-white">
                LEARN SAFETY
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {[
            { icon: <Globe className="text-cyber-neon" size={32} />, title: "URL Scanner", desc: "Instantly verifies if a website link is legitimate or a phishing trap." },
            { icon: <Cpu className="text-cyber-accent" size={32} />, title: "Smishing Detector", desc: "Analyzes SMS and WhatsApp messages for hidden scam patterns." },
            { icon: <Lock className="text-cyber-success" size={32} />, title: "Visual Shield", desc: "Reads text from screenshots (OCR) to detect visual fraud." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -10 }}
              className="p-8 rounded-3xl bg-cyber-dark/50 border border-white/5 hover:border-cyber-neon/30 transition-all"
            >
              <div className="mb-6 p-4 rounded-2xl bg-white/5 w-fit">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Why Choose Us */}
        <div className="p-12 rounded-3xl bg-gradient-to-r from-cyber-dark to-black border border-white/10 flex flex-col md:flex-row items-center justify-between gap-12">
           <div className="flex-1">
             <h2 className="text-3xl font-bold mb-6">Why CyberShield AI?</h2>
             <ul className="space-y-4">
               {['Real-time Analysis (12ms Latency)', 'Trained on Indian Scam Patterns (RBI, UPI)', 'Privacy First - No Data Stored', 'Free for Public Use'].map((item, i)=>(
                 <li key={i} className="flex items-center gap-3 text-gray-300">
                   <CheckCircle className="text-cyber-success" size={20} /> {item}
                 </li>
               ))}
             </ul>
           </div>
           <div className="flex-1 text-center">
              <div className="inline-block p-8 rounded-full bg-cyber-neon/10 border border-cyber-neon/20">
                 <Shield size={64} className="text-cyber-neon animate-pulse" />
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Landing;