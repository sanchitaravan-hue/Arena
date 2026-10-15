import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 animate-fadeIn">
      <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-400 mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-4xl font-extrabold text-white mb-2">404 - Page Not Found</h1>
      <p className="text-xs text-slate-400 max-w-sm mb-6 leading-relaxed">
        The placement training module or page you are trying to access does not exist or has been relocated.
      </p>
      <Button variant="primary" icon={ArrowLeft} onClick={() => navigate('/dashboard')}>
        Return to ARENA Dashboard
      </Button>
    </div>
  );
};

export default NotFound;
