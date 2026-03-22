import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { playerExists } from '@/lib/gameStore';

interface LoginScreenProps {
  onLogin: (batchNo: string, name: string) => void;
  onAdminLogin: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onAdminLogin }) => {
  const [batchNo, setBatchNo] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!batchNo.trim() || !name.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const exists = await playerExists(batchNo.trim());
    setLoading(false);

    if (exists) {
      setError('This Batch Number has already been used. Only one attempt per player.');
      return;
    }

    onLogin(batchNo.trim(), name.trim());
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md animate-bounce-in">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-mono font-extrabold tracking-tight text-primary mb-2">
            HACK<span className="text-accent">WORDLE</span>
          </h1>
          <p className="text-muted-foreground text-sm">
            College Hackathon Word Challenge
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Batch Number</label>
            <Input
              value={batchNo}
              onChange={e => setBatchNo(e.target.value)}
              placeholder="e.g. CSE2024001"
              className="bg-secondary border-border font-mono"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="bg-secondary border-border"
            />
          </div>

          {error && (
            <p className="text-destructive text-sm font-medium">{error}</p>
          )}

          <Button type="submit" className="w-full font-mono font-bold text-base" size="lg" disabled={loading}>
            {loading ? 'Checking...' : 'START GAME →'}
          </Button>
        </form>

        <button
          onClick={onAdminLogin}
          className="mt-4 w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          Admin Access
        </button>
      </div>
    </div>
  );
};

export default LoginScreen;
