"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { confirmarExclusao, confirmarNovoEmail } from "@/app/perfil-actions";

export default function ConfirmarOperacao({ exclusao = false }: { exclusao?: boolean }) {
  const [state, confirm, pending] = useActionState(exclusao ? confirmarExclusao : confirmarNovoEmail, {});
  const [token, setToken] = useState<string | null>(null);
  useEffect(() => setToken(window.location.hash.slice(1)), []);

  const invalid = token !== null && !/^[0-9a-f]{64}$/.test(token);
  return <>
    <h1>{exclusao ? "Confirmar exclusão da conta" : "Confirmar novo e-mail"}</h1>
    {state.message ? <p className="conta-status" role="status">{state.message}</p> : <>
      {token === null && <p role="status">Lendo o link de confirmação…</p>}
      <noscript>Ative o JavaScript e reabra o link para continuar.</noscript>
      {invalid && <p className="conta-error" role="alert">Link inválido. Solicite um novo link em Minha conta.</p>}
      {token && !invalid && <form className="conta-form" action={confirm}>
        <input type="hidden" name="token" value={token} />
        <p>{exclusao
          ? "A exclusão é permanente. Seu progresso, suas anotações e seus trabalhos salvos serão apagados."
          : "Confirme a troca para usar seu novo endereço ao entrar na Trilha Digital."}</p>
        {state.error && <p className="conta-error" role="alert">{state.error}</p>}
        <button type="submit" className={exclusao ? "conta-danger" : "primary-btn"} disabled={pending}>
          {pending ? "Aguarde…" : exclusao ? "Excluir minha conta definitivamente" : "Confirmar novo e-mail"}
        </button>
      </form>}
    </>}
    <nav className="conta-links" aria-label="Opções da conta">
      {state.message ? <Link href="/entrar">Ir para o login</Link> : <Link href="/minha-conta">Voltar para Minha conta</Link>}
    </nav>
  </>;
}
