"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { cadastrar, entrar, recuperarSenha, redefinirSenha } from "@/app/conta-actions";

const forms = {
  login: { title: "Entre na sua conta", button: "Entrar", action: entrar },
  cadastro: { title: "Crie sua conta", button: "Criar conta", action: cadastrar },
  recuperar: { title: "Recupere sua senha", button: "Enviar link", action: recuperarSenha },
  redefinir: { title: "Defina uma nova senha", button: "Salvar nova senha", action: redefinirSenha },
};

export function ContaForm({ mode, notice }: { mode: keyof typeof forms; notice?: string }) {
  const form = forms[mode];
  const [state, submit, pending] = useActionState(form.action, {});
  const [token, setToken] = useState<string | null>(null);
  const hasNewPassword = mode === "cadastro" || mode === "redefinir";

  useEffect(() => {
    if (mode === "redefinir") setToken(window.location.hash.slice(1));
  }, [mode]);

  const invalidToken = mode === "redefinir" && token !== null && !/^[0-9a-f]{64}$/.test(token);
  const visible = mode !== "redefinir" || (token && !invalidToken);

  return (
    <>
      <h1>{form.title}</h1>
      {notice && <p className="conta-status" role="status">{notice}</p>}
      {mode === "recuperar" && <p>Informe o e-mail cadastrado para receber o link de redefinição.</p>}
      {invalidToken && <p role="alert">Link inválido. Solicite um novo link de recuperação.</p>}
      {visible && (
        <form action={submit} className="conta-form">
          {mode === "cadastro" && (
            <label className="conta-field">Nome<input name="nome" autoComplete="name" maxLength={100} required /></label>
          )}
          {mode !== "redefinir" && (
            <label className="conta-field">E-mail<input name="email" type="email" autoComplete={mode === "login" ? "username" : "email"} maxLength={254} required /></label>
          )}
          {mode === "redefinir" && <input name="token" type="hidden" value={token ?? ""} />}
          {mode !== "recuperar" && (
            <label className="conta-field">
              {mode === "redefinir" ? "Nova senha" : "Senha"}
              <input name="password" type="password" autoComplete={hasNewPassword ? "new-password" : "current-password"} aria-describedby={hasNewPassword ? "senha-dica" : undefined} maxLength={256} required />
              {hasNewPassword && <small id="senha-dica">Use de 15 a 128 caracteres.</small>}
            </label>
          )}
          {hasNewPassword && (
            <label className="conta-field">Confirme a senha<input name="confirmation" type="password" autoComplete="new-password" maxLength={256} required /></label>
          )}
          {state.error && <p role="alert" className="conta-error">{state.error}</p>}
          {state.message && <p role="status" className="conta-status">{state.message}</p>}
          <button className="primary-btn" disabled={pending}>{pending ? "Aguarde…" : form.button}</button>
        </form>
      )}
      <nav className="conta-links" aria-label="Opções de acesso">
        {mode === "login" ? <Link href="/cadastro">Criar conta</Link> : <Link href="/entrar">Voltar ao login</Link>}
        {(mode === "login" || mode === "redefinir") && <Link href="/recuperar-senha">Esqueci minha senha</Link>}
      </nav>
    </>
  );
}
