import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-[#111]">
      <header className="flex justify-between items-center p-6 border-b border-border bg-white">
        <h1 className="text-3xl font-pixel font-bold">DOCMIND<span className="text-blue-600">.AI</span></h1>
        <div className="space-x-4">
          <Link to="/login">
            <Button variant="ghost">Log In</Button>
          </Link>
          <Link to="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-3xl space-y-8">
          <h2 className="text-6xl font-pixel font-extrabold leading-tight">
            Transform Documents Into <span className="bg-blue-600 text-white px-2">Knowledge</span>
          </h2>
          <p className="text-xl text-gray-600 font-sans max-w-2xl mx-auto">
            DocMind AI uses advanced Vision and Language models to read, analyze, and chat with your PDFs and images instantly. No more manual data entry.
          </p>
          <div className="pt-8">
            <Link to="/signup">
              <Button size="lg" className="text-lg px-8 py-4 shadow-[4px_4px_0px_0px_#111] hover:shadow-[2px_2px_0px_0px_#111] hover:translate-x-[2px] hover:translate-y-[2px] transition-all">
                Start Chatting for Free
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto w-full">
          <div className="border-2 border-[#111] bg-white p-6 shadow-[4px_4px_0px_0px_#111]">
            <div className="h-12 w-12 bg-blue-100 border-2 border-[#111] flex items-center justify-center mb-4">
              <span className="text-2xl">📄</span>
            </div>
            <h3 className="text-xl font-pixel font-bold mb-2">Instant OCR</h3>
            <p className="text-gray-600">Extracts text from scanned PDFs and complex images using NVIDIA Vision AI instantly.</p>
          </div>
          <div className="border-2 border-[#111] bg-white p-6 shadow-[4px_4px_0px_0px_#111]">
            <div className="h-12 w-12 bg-green-100 border-2 border-[#111] flex items-center justify-center mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-xl font-pixel font-bold mb-2">Smart Chat</h3>
            <p className="text-gray-600">Ask questions about your documents and get precise answers with source citations.</p>
          </div>
          <div className="border-2 border-[#111] bg-white p-6 shadow-[4px_4px_0px_0px_#111]">
            <div className="h-12 w-12 bg-purple-100 border-2 border-[#111] flex items-center justify-center mb-4">
              <span className="text-2xl">⚡️</span>
            </div>
            <h3 className="text-xl font-pixel font-bold mb-2">Lightning Fast</h3>
            <p className="text-gray-600">Powered by serverless architecture and highly optimized AI pipelines for instant results.</p>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-white p-6 text-center text-gray-500 text-sm">
        <p>&copy; 2026 DOCMIND AI. All rights reserved.</p>
      </footer>
    </div>
  );
}
