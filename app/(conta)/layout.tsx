import { Compass } from "lucide-react";
import type { ReactNode } from "react";
import "./conta.css";
import Image from "next/image";

export default function ContaLayout({ children }: { children: ReactNode }) {
  return (
    <main className="conta-shell">
      <div className="conta-panel">
        <div className="brand conta-brand">
          <Image
              src={'/logo.png'}
              alt="logo grupo escoteiro coqueiral"
              width={70}
              height={70}
              quality={100}
              loading="eager"
            />
          <div><b>Aprender sua trilha digital</b><small>19º ES GE Coqueiral</small></div>
        </div>
        {children}
      </div>
    </main>
  );
}
