import React from 'react';
import { Card } from '../components/ui/Card';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { GoogleLogin } from '@react-oauth/google';

export function Signup() {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await api.post('/auth/google', { credential: credentialResponse.credential });
      localStorage.setItem('token', res.data.token);
      navigate('/dashboard');
    } catch (err) {
      alert('Google Signup failed');
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

        <p className="mt-4 text-center text-sm font-sans text-muted">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold underline">Log In</Link>
        </p>
      </Card>
    </div>
  );
}
