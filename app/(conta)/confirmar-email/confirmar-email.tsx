"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { confirmarEmail } from "@/app/conta-actions";

export function ConfirmarEmail() {
  const [state, setState] = useState<Awaited<ReturnType<typeof confirmarEmail>> | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const token = window.location.hash.slice(1);
    confirmarEmail(token).then(setState).catch(() => {
      setState({ error: "Não foi possível confirmar o e-mail. Reabra o link para tentar novamente." });
    });
  }, []);

  return (
    <>
      <h1>Confirmação de e-mail</h1>
      {!state && <p role="status">Verificando seu link de confirmação…</p>}
      {state?.message && <p className="conta-status" role="status">{state.message}</p>}
      {state?.error && <p className="conta-error" role="alert">{state.error}</p>}
      <noscript>Ative o JavaScript e reabra o link para confirmar seu e-mail.</noscript>
      <nav className="conta-links" aria-label="Opções de acesso">
        <Link href="/entrar">Ir para o login</Link>
        {state?.error && <Link href="/reenviar-confirmacao">Reenviar confirmação</Link>}
      </nav>
    </>
  );
}
