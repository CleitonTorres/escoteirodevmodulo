import type { Metadata } from "next";
import ConfirmarOperacao from "../confirmar-operacao";

export const metadata: Metadata = { title: "Confirmar novo e-mail", referrer: "no-referrer", robots: { index: false } };

export default function ConfirmarNovoEmailPage() {
  return <ConfirmarOperacao />;
}
