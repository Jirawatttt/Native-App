import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { Analysis } from './api';

// แทน sessionStorage ของเว็บ: เก็บข้อความที่กรอกและผลวิเคราะห์ไว้ในหน่วยความจำขณะใช้แอป
interface SessionValue {
  userText: string;
  analysis: Analysis | null;
  setUserText: (t: string) => void;
  setAnalysis: (a: Analysis | null) => void;
}

const Ctx = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [userText, setUserText] = useState('');
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const value = useMemo(
    () => ({ userText, analysis, setUserText, setAnalysis }),
    [userText, analysis],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): SessionValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useSession must be used inside SessionProvider');
  return v;
}
