import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { GoogleLogin } from '@react-oauth/google';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      alert('Login failed: ' + (err.response?.data?.error || err.message));
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/google', { credential: credentialResponse.credential });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err: any) {
      alert('Google Login failed: ' + (err.response?.data?.error || err.message));
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background items-center justify-center p-4 relative">
      <Card className="w-full max-w-md relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center font-pixel font-bold text-lg border-2 border-border">
            <div className="animate-spin mb-4 border-4 border-black border-t-transparent rounded-full w-8 h-8"></div>
            Authenticating...
          </div>
        )}
        <h1 className="text-3xl font-pixel font-bold mb-6 text-center">DOCMIND<span className="text-blue-600">.AI</span></h1>
        
        <div className="flex justify-center mb-6 mt-8">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              alert('Google Login Failed');
            }}
            useOneTap
            shape="rectangular"
            theme="outline"
            text="continue_with"
            size="large"
          />
        </div>

        <div className="relative flex py-5 items-center">
          <div className="flex-grow border-t border-border"></div>
          <span className="flex-shrink-0 mx-4 text-muted text-sm font-pixel">OR</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-pixel mb-1">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-border bg-gray-50 focus:bg-white outline-none font-sans shadow-[2px_2px_0px_0px_#111]" 
            />
          </div>
          <div>
            <label className="block text-sm font-pixel mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-border bg-gray-50 focus:bg-white outline-none font-sans shadow-[2px_2px_0px_0px_#111]" 
            />
          </div>
          <Button type="submit" className="w-full">Log In with Email</Button>
        </form>

        <p className="mt-4 text-center text-sm font-sans text-muted">
          Don't have an account? <Link to="/signup" className="text-blue-600 font-bold underline">Sign Up</Link>
        </p>
      </Card>
    </div>
  );
}
