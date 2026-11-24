import type { Metadata } from 'next';
import './globals.css';
import './accessibility.css';
export const metadata: Metadata = { title: 'Trilha Digital | Grupo Escoteiro Coqueiral', description: 'Aprenda informática fazendo, com a trilha do Coqueiral.' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="pt-BR"><body>{children}</body></html>; }
