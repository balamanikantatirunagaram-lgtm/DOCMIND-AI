import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [org, setOrg] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', { 
        email, 
        password, 
        name, 
        organizationName: org 
      });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      alert('Signup failed');
    }
  };

  return (
    <div className="flex h-screen bg-background items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-pixel font-bold mb-6 text-center">DOCMIND<span className="text-blue-600">.AI</span></h1>
        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-pixel mb-1">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border border-border bg-gray-50 focus:bg-white outline-none font-sans shadow-[2px_2px_0px_0px_#111]" />
          </div>
          <div>
            <label className="block text-sm font-pixel mb-1">Organization</label>
            <input type="text" value={org} onChange={(e) => setOrg(e.target.value)} className="w-full p-2 border border-border bg-gray-50 focus:bg-white outline-none font-sans shadow-[2px_2px_0px_0px_#111]" />
          </div>
          <div>
            <label className="block text-sm font-pixel mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 border border-border bg-gray-50 focus:bg-white outline-none font-sans shadow-[2px_2px_0px_0px_#111]" />
          </div>
          <div>
            <label className="block text-sm font-pixel mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 border border-border bg-gray-50 focus:bg-white outline-none font-sans shadow-[2px_2px_0px_0px_#111]" />
          </div>
          <Button type="submit" className="w-full">Sign Up</Button>
        </form>
        <p className="mt-4 text-center text-sm font-sans text-muted">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold underline">Log In</Link>
        </p>
      </Card>
    </div>
  );
}
