import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Shield, Menu, X } from 'lucide-react';
import { useState } from 'react';

// Import Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Education from './pages/Education';
import Assistant from './components/Assistant';

// Navbar Component
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path ? "text-cyber-neon" : "text-gray-400 hover:text-white";

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-cyber-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-2xl font-bold tracking-tighter">
          <Shield className="text-cyber-neon fill-cyber-neon/20" />
          <span>CYBERSHIELD <span className="text-cyber-neon">AI</span></span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-8 text-sm font-bold tracking-wider">
          <Link to="/" className={`transition-colors ${isActive('/')}`}>HOME</Link>
          <Link to="/dashboard" className={`transition-colors ${isActive('/dashboard')}`}>SCANNER</Link>
          <Link to="/education" className={`transition-colors ${isActive('/education')}`}>EDUCATION & SAFETY</Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden bg-cyber-dark border-b border-white/10 p-4 space-y-4">
           <Link to="/" onClick={()=>setIsOpen(false)} className="block text-gray-300 font-bold">Home</Link>
           <Link to="/dashboard" onClick={()=>setIsOpen(false)} className="block text-gray-300 font-bold">Scanner</Link>
           <Link to="/education" onClick={()=>setIsOpen(false)} className="block text-gray-300 font-bold">Education</Link>
        </div>
      )}
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      
      {/* Page Content */}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/education" element={<Education />} />
      </Routes>

      {/* Floating AI Assistant */}
      <Assistant />
      
    </Router>
  );
}

export default App;