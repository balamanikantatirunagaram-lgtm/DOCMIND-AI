import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import { FileText, MessageSquare, Zap, ChevronRight, UploadCloud, BrainCircuit } from 'lucide-react';

export function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col font-sans text-[#111] overflow-hidden relative">
      {/* Background Dot Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20" 
        style={{
          backgroundImage: 'radial-gradient(#111 1px, transparent 1px)',
          backgroundSize: '24px 24px'
        }}
      ></div>

      <header className="relative z-10 flex justify-between items-center p-6 bg-white/80 backdrop-blur-md border-b-2 border-[#111]">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 w-6 h-6 border-2 border-[#111] shadow-[2px_2px_0px_0px_#111]"></div>
          <h1 className="text-2xl font-pixel font-bold tracking-tight">DOCMIND<span className="text-blue-600">.AI</span></h1>
        </div>
        <div className="flex space-x-4 items-center">
          <Link to="/login" className="font-pixel text-sm hover:underline hover:text-blue-600 transition-colors">
            Log In
          </Link>
          <Link to="/signup">
            <Button className="font-pixel text-sm px-6 py-2 bg-[#111] text-white border-2 border-[#111] shadow-[4px_4px_0px_0px_#2563EB] hover:shadow-[2px_2px_0px_0px_#2563EB] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center pt-24 pb-32 px-6">
        <motion.div 
          className="max-w-4xl text-center space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={itemVariants} className="inline-block mb-4 px-4 py-1 border-2 border-[#111] bg-yellow-200 shadow-[2px_2px_0px_0px_#111]">
            <span className="font-pixel text-sm font-bold uppercase tracking-widest">v2.0 Vision AI Now Live</span>
          </motion.div>
          
          <motion.h2 variants={itemVariants} className="text-5xl md:text-7xl font-sans font-extrabold leading-[1.2] tracking-tight">
            Chat with your <br/>
            <span className="relative inline-block mt-4 md:mt-6">
              <span className="absolute inset-0 bg-blue-600 translate-x-2 translate-y-2 border-2 border-[#111]"></span>
              <span className="relative bg-white text-[#111] border-2 border-[#111] px-6 py-3 block font-pixel uppercase tracking-tight text-4xl md:text-6xl">Documents</span>
            </span>
          </motion.h2>
          
          <motion.p variants={itemVariants} className="text-xl md:text-2xl text-gray-700 font-sans max-w-2xl mx-auto leading-relaxed pt-6">
            DocMind AI uses advanced Vision models to instantly read, analyze, and extract insights from your PDFs and images. 
          </motion.p>
          
          <motion.div variants={itemVariants} className="pt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/signup">
              <button className="flex items-center gap-2 font-pixel text-lg bg-blue-600 text-white px-8 py-4 border-4 border-[#111] shadow-[6px_6px_0px_0px_#111] hover:shadow-[2px_2px_0px_0px_#111] hover:translate-x-[4px] hover:translate-y-[4px] transition-all active:shadow-none active:translate-x-[6px] active:translate-y-[6px]">
                Start For Free <ChevronRight size={24} />
              </button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Abstract App Mockup */}
        <motion.div 
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 100, damping: 20 }}
          className="mt-24 w-full max-w-5xl border-4 border-[#111] bg-white shadow-[16px_16px_0px_0px_rgba(37,99,235,0.2)] rounded-sm overflow-hidden flex flex-col"
        >
          {/* Mockup Header */}
          <div className="border-b-4 border-[#111] bg-gray-100 p-4 flex gap-2 items-center">
            <div className="w-4 h-4 rounded-full border-2 border-[#111] bg-red-400"></div>
            <div className="w-4 h-4 rounded-full border-2 border-[#111] bg-yellow-400"></div>
            <div className="w-4 h-4 rounded-full border-2 border-[#111] bg-green-400"></div>
            <div className="ml-4 font-pixel text-sm text-gray-500">app.docmind.ai</div>
          </div>
          {/* Mockup Body */}
          <div className="flex h-96">
            {/* Sidebar */}
            <div className="w-1/4 border-r-4 border-[#111] bg-gray-50 p-4 hidden md:block space-y-4">
              <div className="h-8 bg-gray-200 border-2 border-[#111] w-full"></div>
              <div className="h-8 bg-gray-200 border-2 border-[#111] w-3/4"></div>
              <div className="h-8 bg-gray-200 border-2 border-[#111] w-5/6"></div>
            </div>
            {/* Main Content Area */}
            <div className="flex-1 p-8 flex flex-col gap-6 relative">
              <div className="self-end bg-blue-100 border-2 border-[#111] p-4 max-w-[70%] shadow-[4px_4px_0px_0px_#111]">
                <p className="font-sans font-medium">Summarize the key financial points from the Q3 earnings report.</p>
              </div>
              <div className="self-start bg-green-50 border-2 border-[#111] p-4 max-w-[80%] shadow-[4px_4px_0px_0px_#111]">
                <div className="flex items-center gap-2 font-pixel font-bold mb-2">
                  <BrainCircuit size={18} /> AI Response
                </div>
                <p className="font-sans text-gray-700">Based on the Q3 report, revenue grew by 24% year-over-year. Operating margins improved to 18%, driven by efficiency gains in the enterprise sector.</p>
              </div>
              {/* Fake Input */}
              <div className="absolute bottom-8 left-8 right-8 border-2 border-[#111] bg-white p-3 flex justify-between items-center shadow-[4px_4px_0px_0px_#111]">
                <span className="text-gray-400 font-pixel text-sm">Ask anything...</span>
                <div className="bg-blue-600 p-2 border-2 border-[#111]"><Zap size={16} className="text-white" /></div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Features Section */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
          {[
            { icon: <UploadCloud size={32}/>, title: 'Instant OCR', desc: 'Upload scanned PDFs or complex images. Our NVIDIA Vision AI reads it instantly.', color: 'bg-red-100' },
            { icon: <MessageSquare size={32}/>, title: 'Smart Chat', desc: 'Ask questions and extract exactly what you need. Stop reading 50-page documents.', color: 'bg-green-100' },
            { icon: <Zap size={32}/>, title: 'Lightning Fast', desc: 'Built on Edge architecture with optimized pipelines to deliver answers in milliseconds.', color: 'bg-yellow-100' },
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.2 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="border-4 border-[#111] bg-white p-8 shadow-[8px_8px_0px_0px_#111] group hover:shadow-[16px_16px_0px_0px_#111] transition-all cursor-default"
            >
              <div className={`h-16 w-16 ${feature.color} border-4 border-[#111] flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_#111] group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h3 className="text-2xl font-pixel font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-600 font-sans leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      <footer className="border-t-4 border-[#111] bg-[#111] text-white p-8 text-center mt-20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <h2 className="text-xl font-pixel font-bold tracking-tight mb-4 md:mb-0">DOCMIND<span className="text-blue-500">.AI</span></h2>
          <p className="font-pixel text-sm text-gray-400">&copy; 2026 Crafted with ❤️ for Hackathons.</p>
        </div>
      </footer>
    </div>
  );
}
