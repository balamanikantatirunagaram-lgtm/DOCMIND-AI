import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { GoogleLogin } from '@react-oauth/google';

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
    } catch (err: any) {
      alert('Signup failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await api.post('/auth/google', { credential: credentialResponse.credential });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      alert('Google Signup failed: ' + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="flex h-screen bg-background items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <h1 className="text-3xl font-pixel font-bold mb-6 text-center">DOCMIND<span className="text-blue-600">.AI</span></h1>
        
        <div className="flex justify-center mb-6 mt-8">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              alert('Google Signup Failed');
            }}
            useOneTap
            shape="rectangular"
            theme="outline"
            text="signup_with"
            size="large"
          />
        </div>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink-0 mx-4 text-muted text-sm font-pixel">OR</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

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
          <Button type="submit" className="w-full">Sign Up with Email</Button>
        </form>

        <p className="mt-4 text-center text-sm font-sans text-muted">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold underline">Log In</Link>
        </p>
      </Card>
    </div>
  );
}
