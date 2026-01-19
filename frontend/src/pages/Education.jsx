import React from 'react';
import { Phone, AlertTriangle, ShieldCheck, FileText, ExternalLink } from 'lucide-react';

const Education = () => {
  return (
    <div className="min-h-screen bg-cyber-black text-white p-6 pt-28 font-sans">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
        
        {/* LEFT COLUMN: EXPERT HELP */}
        <div>
          <h1 className="text-4xl font-bold mb-2 text-cyber-neon">Expert Support</h1>
          <p className="text-gray-400 mb-8">Found a malicious email or lost money? Take action immediately.</p>

          {/* Emergency Contact Card */}
          <div className="bg-cyber-dark/80 p-8 rounded-3xl border border-cyber-neon/30 shadow-lg shadow-cyber-neon/10 mb-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 bg-cyber-danger text-xs font-bold rounded-bl-2xl">EMERGENCY</div>
             <h2 className="text-2xl font-bold flex items-center gap-3 mb-6">
              <Phone className="text-cyber-success" /> National Helpline
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <div className="font-bold text-lg">1930</div>
                  <div className="text-sm text-gray-400">Cyber Crime Toll-Free Number</div>
                </div>
                <a href="tel:1930" className="px-6 py-2 bg-cyber-neon hover:bg-cyber-accent rounded-lg font-bold transition-colors">Call Now</a>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                 <div className="font-bold mb-1">Official Portal</div>
                 <a href="https://cybercrime.gov.in" target="_blank" className="text-cyber-neon hover:underline text-sm flex items-center gap-1">
                   www.cybercrime.gov.in <ExternalLink size={12}/>
                 </a>
              </div>
            </div>
          </div>

          {/* Next Steps Checklist */}
          <div className="bg-cyber-dark p-8 rounded-3xl border border-white/10">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ShieldCheck className="text-cyber-neon"/> Immediate Action Plan
            </h3>
            <ul className="space-y-3">
              {[
                "Disconnect your device from the Internet immediately.",
                "Call 1930 to report the transaction within the 'Golden Hour'.",
                "Contact your bank to block Debit/Credit cards.",
                "Take screenshots of the chat/payment as evidence.",
                "Do not delete the malicious message or email."
              ].map((step, i) => (
                <li key={i} className="flex gap-3 text-gray-300 text-sm">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">{i+1}</span>
                  {step}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT COLUMN: NEWS & EDUCATION */}
        <div className="space-y-8">
           <h2 className="text-3xl font-bold flex items-center gap-3">
              <FileText className="text-cyber-accent" /> Security News & Tips
           </h2>

           {/* News Items */}
           <div className="space-y-4">
              {[
                { title: "New 'Digital Arrest' Scam on Rise", date: "Jan 18, 2026", desc: "Scammers posing as police on video calls to extort money. Police never video call." },
                { title: "Fake Electricity Bill SMS", date: "Jan 15, 2026", desc: "Do not click links saying your power will be cut tonight. Verify with board." },
                { title: "Part-time Job Fraud", date: "Jan 12, 2026", desc: "Avoid 'Task-based' jobs asking for investment via Telegram." }
              ].map((news, i) => (
                <div key={i} className="p-6 bg-cyber-dark border border-white/10 rounded-2xl hover:border-cyber-neon/50 transition-colors group cursor-pointer">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg group-hover:text-cyber-neon transition-colors">{news.title}</h3>
                    <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">{news.date}</span>
                  </div>
                  <p className="text-gray-400 text-sm">{news.desc}</p>
                </div>
              ))}
           </div>

           {/* Education Card */}
           <div className="p-6 bg-gradient-to-br from-cyber-neon/20 to-transparent border border-cyber-neon/30 rounded-2xl">
              <h3 className="font-bold mb-2 text-white">Did you know?</h3>
              <p className="text-sm text-gray-300">
                Banks will <strong>never</strong> ask for your OTP, PIN, or CVV over the phone. If a caller asks for these, disconnect immediately.
              </p>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Education;