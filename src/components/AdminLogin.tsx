import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { validateAdmin } from '@/lib/gameStore';

interface AdminLoginProps {
  onSuccess: () => void;
  onBack: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onBack }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateAdmin(password)) {
      onSuccess();
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-bounce-in">
        <h2 className="text-xl font-mono font-bold text-foreground mb-4 text-center">Admin Login</h2>
        <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="bg-secondary border-border font-mono"
            />
          </div>
          {error && <p className="text-destructive text-sm">{error}</p>}
          <div className="flex gap-3">
            <Button onClick={onBack} type="button" variant="outline" className="flex-1 font-mono">
              ← Back
            </Button>
            <Button type="submit" className="flex-1 font-mono font-bold">
              Login
            </Button>
          </div>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-3">Default: hackathon2026</p>
      </div>
    </div>
  );
};

export default AdminLogin;
