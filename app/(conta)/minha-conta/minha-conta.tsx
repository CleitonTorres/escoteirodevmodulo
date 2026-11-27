"use client";

import { useActionState } from "react";
import Link from "next/link";
import { salvarPerfil, solicitarExclusao, solicitarNovoEmail } from "@/app/perfil-actions";
import type { StudentProfile } from "@/lib/auth/profile";
import PerfilFields from "../perfil-fields";

function Status({ error, message }: { error?: string; message?: string }) {
  if (error) return <p className="conta-error" role="alert">{error}</p>;
  if (message) return <p className="conta-status" role="status">{message}</p>;
}

function CurrentPassword() {
  return <label className="conta-field">
    Senha atual
    <input name="password" type="password" autoComplete="current-password" maxLength={256} required />
  </label>;
}

export default function MinhaConta({ nome, email, perfil }: { nome: string; email: string; perfil?: StudentProfile }) {
  const [profile, save, saving] = useActionState(salvarPerfil, {});
  const [newEmail, changeEmail, changingEmail] = useActionState(solicitarNovoEmail, {});
  const [deletion, requestDeletion, requestingDeletion] = useActionState(solicitarExclusao, {});

  return <>
    <h1>Minha conta</h1>
    <form className="conta-form" action={save} aria-label="Dados cadastrais">
      <label className="conta-field">
        Nome
        <input name="nome" autoComplete="name" maxLength={100} defaultValue={profile.nome ?? nome} required />
      </label>
      <PerfilFields perfil={profile.perfil ?? perfil} />
      <Status {...profile} />
      <button type="submit" className="primary-btn" disabled={saving}>{saving ? "Salvando…" : "Salvar dados"}</button>
    </form>

    <section className="conta-section" aria-label="E-mail da conta">
      <p><strong>E-mail atual</strong><br />{email}</p>
      <details className="conta-details">
        <summary>Trocar e-mail</summary>
        <form className="conta-form" action={changeEmail}>
          <label className="conta-field">
            Novo e-mail
            <input name="email" type="email" autoComplete="email" maxLength={254} defaultValue={newEmail.email} required />
          </label>
          <CurrentPassword />
          <Status {...newEmail} />
          <button type="submit" className="primary-btn" disabled={changingEmail}>
            {changingEmail ? "Enviando…" : "Enviar confirmação para o novo e-mail"}
          </button>
        </form>
      </details>
    </section>

    <details className="conta-section conta-details">
      <summary>Excluir conta</summary>
      <form className="conta-form" action={requestDeletion}>
        <p>A exclusão remove sua conta, seu progresso e os trabalhos salvos. Para confirmar, você receberá um link no e-mail cadastrado.</p>
        <CurrentPassword />
        <Status {...deletion} />
        <button type="submit" className="conta-danger" disabled={requestingDeletion}>
          {requestingDeletion ? "Enviando…" : "Solicitar link de exclusão"}
        </button>
      </form>
    </details>
    <nav className="conta-links" aria-label="Voltar para a Trilha Digital">
      <Link href="/">Voltar às aulas</Link>
    </nav>
  </>;
}
