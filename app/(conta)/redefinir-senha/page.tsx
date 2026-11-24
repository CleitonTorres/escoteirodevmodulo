import type { Metadata } from "next";
import { ContaForm } from "../conta-form";

export const metadata: Metadata = { referrer: "no-referrer", robots: { index: false } };

export default function RedefinirSenhaPage() {
  return <ContaForm mode="redefinir" />;
}
