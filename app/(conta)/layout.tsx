import { Compass } from "lucide-react";
import type { ReactNode } from "react";
import "./conta.css";

export default function ContaLayout({ children }: { children: ReactNode }) {
  return (
    <main className="conta-shell">
      <div className="conta-panel">
        <div className="brand conta-brand">
          <div className="brand-mark"><Compass size={24} aria-hidden="true" /></div>
          <div><b>trilha digital</b><small>19º GE Coqueiral</small></div>
        </div>
        {children}
      </div>
    </main>
  );
}
