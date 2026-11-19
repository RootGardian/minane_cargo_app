import React, { useState } from 'react';
import { X, Lock, Mail, Shield } from 'lucide-react';
import { api, setAdminToken } from '../services/api';

export default function AdminLoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResetAndClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.loginAdmin({ email, password });
      setAdminToken(data.token);
      setEmail('');
      setPassword('');
      setError('');
      onLoginSuccess(data.admin);
      onClose();
    } catch (err) {
      setError(err.message || 'Identifiants administrateur incorrects.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={handleResetAndClose}
    >
      <div 
        className="bg-white max-w-md w-full border border-[#E2E8F0] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="bg-[#042442] text-white px-6 py-4 flex items-center justify-between border-b-2 border-[#E2001A]">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-[#E2001A]" />
            <div>
              <span className="text-[10px] tracking-[0.2em] font-semibold text-slate-300 uppercase block font-serif">
                DIRECTION & GESTION OPÉRATIONNELLE
              </span>
              <h3 className="text-lg font-bold">Portail Administrateur Minane</h3>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="text-slate-300 hover:text-white transition p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-[#E2001A] text-xs font-semibold">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#042442] uppercase tracking-wider mb-1">
              Email Professionnel
            </label>
            <div className="relative">
              <input
                type="email"
                placeholder="admin@minanecargo.sn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 border border-[#CBD5E1] text-[#042442] text-sm focus:outline-none focus:border-[#042442]"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#042442] uppercase tracking-wider mb-1">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-9 pr-4 py-2.5 border border-[#CBD5E1] text-[#042442] text-sm focus:outline-none focus:border-[#042442]"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#042442] hover:bg-[#083863] text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            <span>{loading ? 'Authentification...' : 'Ouvrir la session Direction'}</span>
          </button>

        </form>

      </div>
    </div>
  );
}
