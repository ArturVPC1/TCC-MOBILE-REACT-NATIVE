import { useQueryClient } from '@tanstack/react-query';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { load, remove, save } from '../lib/storage';
import { api } from '../services/api';
import { User } from '../types/domain';

const KEY = 'sonata:session:v2';

// Credenciais de demonstração (protótipo).
export const DEMO = { email: 'admin@exemplo.com', password: '123456' };

interface AuthCtx {
  user: User | null;
  isRestoring: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
const Ctx = createContext<AuthCtx>(null as never);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const qc = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const [isRestoring, setRestoring] = useState(true);

  useEffect(() => {
    load<{ token: string; user: User } | null>(KEY, null).then((s) => {
      setUser(s?.user ?? null);
      setRestoring(false);
    });
  }, []);

  const signIn = async (email: string, password: string) => {
    const res = await api.auth.login(email, password);
    await save(KEY, res);
    setUser(res.user);
  };

  const signOut = async () => {
    await remove(KEY);
    qc.clear();
    setUser(null);
  };

  return <Ctx.Provider value={{ user, isRestoring, signIn, signOut }}>{children}</Ctx.Provider>;
}
