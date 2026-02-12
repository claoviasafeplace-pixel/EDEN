'use client';

import { useState, useEffect } from 'react';
import type { SocialAccount } from '@/lib/types';
import { Instagram, Film, CheckCircle, AlertCircle, RefreshCw, LogOut } from 'lucide-react';
import Button from './ui/Button';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export default function SocialConnections() {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/social_accounts?order=platform`, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      });
      const data = await res.json();
      setAccounts(Array.isArray(data) ? data : []);
    } catch {
      setAccounts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  // Check URL params for auth result
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const success = params.get('auth_success');
    const error = params.get('auth_error');
    if (success || error) {
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
      if (success) fetchAccounts();
    }
  }, []);

  const handleDisconnect = async (id: number) => {
    await fetch(`${SUPABASE_URL}/rest/v1/social_accounts?id=eq.${id}`, {
      method: 'DELETE',
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    fetchAccounts();
  };

  const igAccount = accounts.find(a => a.platform === 'instagram');
  const ttAccount = accounts.find(a => a.platform === 'tiktok');

  const isExpired = (account: SocialAccount) =>
    account.expires_at ? new Date(account.expires_at) < new Date() : false;

  if (loading) {
    return (
      <div className="vm-card overflow-hidden">
        <div className="px-6 py-5 border-b border-vm-border-light">
          <h3 className="font-semibold text-[15px] text-vm-text">Reseaux sociaux</h3>
        </div>
        <div className="px-6 py-8 flex items-center justify-center">
          <RefreshCw className="w-5 h-5 text-vm-muted animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="vm-card overflow-hidden">
      <div className="px-6 py-5 border-b border-vm-border-light">
        <h3 className="font-semibold text-[15px] text-vm-text">Reseaux sociaux</h3>
        <p className="text-xs text-vm-muted mt-1">Connectez vos comptes pour publier directement.</p>
      </div>
      <div className="divide-y divide-vm-border-light">
        {/* Instagram */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center shrink-0">
              <Instagram className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-vm-text">Instagram</p>
              {igAccount ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isExpired(igAccount) ? (
                    <>
                      <AlertCircle className="w-3 h-3 text-amber-500" />
                      <span className="text-xs text-amber-600">Token expire — reconnectez</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-vm-muted">@{igAccount.account_name}</span>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-xs text-vm-muted mt-0.5">Non connecte</p>
              )}
            </div>
          </div>
          {igAccount ? (
            <button
              onClick={() => handleDisconnect(igAccount.id)}
              className="text-xs text-vm-muted hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" /> Deconnecter
            </button>
          ) : (
            <a href="/api/auth/instagram">
              <Button size="sm" variant="secondary">Connecter</Button>
            </a>
          )}
        </div>

        {/* TikTok */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
              <Film className="w-5 h-5 text-vm-text" />
            </div>
            <div>
              <p className="text-sm font-medium text-vm-text">TikTok</p>
              {ttAccount ? (
                <div className="flex items-center gap-1.5 mt-0.5">
                  {isExpired(ttAccount) ? (
                    <>
                      <AlertCircle className="w-3 h-3 text-amber-500" />
                      <span className="text-xs text-amber-600">Token expire — reconnectez</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span className="text-xs text-vm-muted">{ttAccount.account_name}</span>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-xs text-vm-muted mt-0.5">Non connecte</p>
              )}
            </div>
          </div>
          {ttAccount ? (
            <button
              onClick={() => handleDisconnect(ttAccount.id)}
              className="text-xs text-vm-muted hover:text-red-600 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <LogOut className="w-3 h-3" /> Deconnecter
            </button>
          ) : (
            <a href="/api/auth/tiktok">
              <Button size="sm" variant="secondary">Connecter</Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
