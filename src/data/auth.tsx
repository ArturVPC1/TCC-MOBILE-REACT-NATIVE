import React, { createContext, useContext, useEffect, useState } from 'react';
import { load, remove, save } from '../lib/storage';

export interface User { name: string; email: string }
const KEY = 'sonata:session:v1';

// Credenciais de demonstração (protótipo).
export const DEMO = { email: 'admin@exemplo.com', password: 'admin123' };

interface AuthCtx {
  user: User | null;
  ready: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}
const Ctx = createContext<AuthCtx>(null as never);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    load<User | null>(KEY, null).then((u) => { setUser(u); setReady(true); });
  }, []);

  const signIn = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 600));
    if (email.trim().toLowerCase() !== DEMO.email || password !== DEMO.password) {
      throw new Error('E-mail ou senha incorretos.');
    }
    const u = { name: 'Administrador', email: DEMO.email };
    await save(KEY, u);
    setUser(u);
  };
  const signOut = async () => { await remove(KEY); setUser(null); };

  return <Ctx.Provider value={{ user, ready, signIn, signOut }}>{children}</Ctx.Provider>;
}
